import { useState, useEffect, useCallback, useRef } from "react";

// ─── DATA ──────────────────────────────────────────────
const codeExamples = {
  "1-0-0": { // SOLID
    examples: [
      {
        title: "❌ Πριν: Παραβίαση Single Responsibility",
        code: `public class UserService
{
    public void Register(string email, string password)
    {
        // Validation
        if (!email.Contains("@"))
            throw new Exception("Invalid email");

        // Save to DB
        var conn = new SqlConnection("...");
        conn.Open();
        // ... save user

        // Send email
        var smtp = new SmtpClient("smtp.gmail.com");
        smtp.Send("welcome@app.com", email, 
            "Welcome!", "Thanks for registering!");

        // Log
        File.AppendAllText("log.txt", 
            $"{DateTime.Now}: User {email} registered");
    }
}`,
        explanation: "Αυτή η class κάνει 4 πράγματα: validation, database, email, logging. Αν αλλάξει ο τρόπος αποστολής email, πρέπει να τροποποιήσεις το UserService!",
      },
      {
        title: "✅ Μετά: SOLID σε εφαρμογή",
        code: `// Κάθε interface = μία ευθύνη
public interface IUserValidator
{
    bool Validate(string email, string password);
}

public interface IUserRepository
{
    Task<User> CreateAsync(string email, string password);
}

public interface IEmailService
{
    Task SendWelcomeAsync(string email);
}

// Το UserService κάνει μόνο orchestration
public class UserService(
    IUserValidator validator,
    IUserRepository repository,
    IEmailService emailService,
    ILogger<UserService> logger)
{
    public async Task RegisterAsync(
        string email, string password)
    {
        if (!validator.Validate(email, password))
            throw new ValidationException("Invalid input");

        var user = await repository.CreateAsync(
            email, password);
        await emailService.SendWelcomeAsync(email);
        logger.LogInformation(
            "User {Email} registered", email);
    }
}`,
        explanation: "Τώρα κάθε class έχει ΜΙΑ ευθύνη. Αλλάζεις email provider; Φτιάχνεις νέο IEmailService. Το UserService δεν αλλάζει ποτέ. Πρόσεξε και το Primary Constructor syntax — νέο στο C#!",
      },
    ],
    walkthrough: [
      { step: "Βήμα 1: Αναγνώρισε τις ευθύνες", detail: "Ρώτα: «Πόσοι λόγοι υπάρχουν για να αλλάξει αυτή η class;» Αν >1, χρειάζεται split.", output: "Ευθύνες: Validation, Persistence, Email, Logging = 4 λόγοι αλλαγής" },
      { step: "Βήμα 2: Δημιούργησε interfaces", detail: "Κάθε ευθύνη γίνεται interface: IUserValidator, IUserRepository, IEmailService + ILogger (built-in στο .NET).", output: "4 interfaces, κάθε ένα με 1-2 μεθόδους" },
      { step: "Βήμα 3: Υλοποίησε τα implementations", detail: "EmailValidator, SqlUserRepository, SmtpEmailService — κάθε class κάνει ΕΝΑ πράγμα.", output: "Κάθε class < 30 γραμμές κώδικα" },
      { step: "Βήμα 4: Σύνδεσε με DI", detail: "Στο Program.cs: builder.Services.AddScoped<IEmailService, SmtpEmailService>();", output: "var app = builder.Build(); // Όλα συνδεδεμένα!" },
    ],
    quiz: [
      { q: "Ποια αρχή παραβιάζεται αν μια class κάνει validation ΚΑΙ database access;", options: ["Open/Closed", "Single Responsibility", "Liskov Substitution", "Interface Segregation"], correct: 1 },
      { q: "Τι σημαίνει Open/Closed Principle;", options: ["Ο κώδικας πρέπει να είναι open source", "Ανοιχτό για επέκταση, κλειστό για τροποποίηση", "Τα methods πρέπει να είναι public", "Πρέπει να χρησιμοποιείς open generics"], correct: 1 },
      { q: "Πώς εφαρμόζουμε Dependency Inversion στο .NET;", options: ["Με static classes", "Με DI container (builder.Services.Add...)", "Με inheritance μόνο", "Με global variables"], correct: 1 },
    ],
    starterCode: `// Δοκίμασε! Κάνε refactor αυτή τη class
// ώστε να ακολουθεί το Single Responsibility Principle

public class OrderProcessor
{
    public void ProcessOrder(Order order)
    {
        // Validate
        if (order.Items.Count == 0)
            throw new Exception("Empty order");

        // Calculate total
        decimal total = 0;
        foreach (var item in order.Items)
            total += item.Price * item.Quantity;

        // Apply discount
        if (total > 100)
            total *= 0.9m;

        // Save to database
        var db = new Database();
        db.Save(order);

        // Send confirmation email
        var mailer = new Mailer();
        mailer.Send(order.Email, "Order confirmed!");
    }
}

// Σπάσε τη σε: IOrderValidator, 
// IPricingService, IOrderRepository, INotificationService`,
  },
  "1-0-1": { // Design Patterns
    examples: [
      {
        title: "Strategy Pattern — Discount System",
        code: `// Interface = η στρατηγική
public interface IDiscountStrategy
{
    decimal Calculate(decimal price);
    string Name { get; }
}

// Κάθε implementation = μια στρατηγική
public class NoDiscount : IDiscountStrategy
{
    public string Name => "Κανένα";
    public decimal Calculate(decimal price) => price;
}

public class SeasonalDiscount : IDiscountStrategy
{
    public string Name => "Εποχιακό -20%";
    public decimal Calculate(decimal price) 
        => price * 0.80m;
}

public class VipDiscount : IDiscountStrategy
{
    public string Name => "VIP -30%";
    public decimal Calculate(decimal price) 
        => price * 0.70m;
}

// Χρήση — η στρατηγική αλλάζει runtime!
public class OrderService(IDiscountStrategy discount)
{
    public decimal GetFinalPrice(decimal price)
    {
        var final = discount.Calculate(price);
        Console.WriteLine(
            $"Discount: {discount.Name}");
        Console.WriteLine(
            $"Price: {price:C} → {final:C}");
        return final;
    }
}`,
        explanation: "Το Strategy pattern σου επιτρέπει να αλλάζεις αλγόριθμο runtime χωρίς if/else. Νέο discount; Φτιάχνεις νέα class, δεν αλλάζεις τίποτα άλλο!",
      },
      {
        title: "Repository Pattern — Data Access",
        code: `// Generic repository interface
public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(int id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<T> AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(int id);
}

// EF Core implementation
public class Repository<T>(AppDbContext db) 
    : IRepository<T> where T : class
{
    private readonly DbSet<T> _set = db.Set<T>();

    public async Task<T?> GetByIdAsync(int id) 
        => await _set.FindAsync(id);

    public async Task<IEnumerable<T>> GetAllAsync() 
        => await _set.ToListAsync();

    public async Task<T> AddAsync(T entity)
    {
        await _set.AddAsync(entity);
        await db.SaveChangesAsync();
        return entity;
    }

    public async Task UpdateAsync(T entity)
    {
        _set.Update(entity);
        await db.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _set.FindAsync(id);
        if (entity != null)
        {
            _set.Remove(entity);
            await db.SaveChangesAsync();
        }
    }
}

// DI Registration
builder.Services.AddScoped(
    typeof(IRepository<>), typeof(Repository<>));`,
        explanation: "Ένα generic Repository δουλεύει για ΟΛΕΣ τις entities. Αλλάζεις database; Φτιάχνεις νέο implementation, τα services δεν αλλάζουν!",
      },
    ],
    walkthrough: [
      { step: "Βήμα 1: Επίλεξε το pattern", detail: "Ρώτα: Χρειάζομαι εναλλακτικούς αλγορίθμους (Strategy), δημιουργία objects (Factory), ή αντίδραση σε events (Observer);", output: "Πρόβλημα: 3 τρόποι discount → Strategy Pattern" },
      { step: "Βήμα 2: Γράψε το interface", detail: "IDiscountStrategy με μία μέθοδο: Calculate(decimal) → decimal", output: "interface IDiscountStrategy { decimal Calculate(decimal price); }" },
      { step: "Βήμα 3: Υλοποίησε 2-3 strategies", detail: "NoDiscount, SeasonalDiscount, VipDiscount — κάθε μία < 5 γραμμές.", output: "3 classes, κάθε μία κάνει ΕΝΑ πράγμα" },
      { step: "Βήμα 4: Inject μέσω DI", detail: "builder.Services.AddScoped<IDiscountStrategy, SeasonalDiscount>(); ή χρησιμοποίησε Factory pattern.", output: "Runtime επιλογή strategy!" },
    ],
    quiz: [
      { q: "Πότε χρησιμοποιείς Strategy αντί για if/else;", options: ["Πάντα", "Όταν υπάρχουν 2+ αλγόριθμοι που αλλάζουν runtime", "Μόνο σε web apps", "Μόνο με databases"], correct: 1 },
      { q: "Τι κάνει το Repository Pattern;", options: ["Αποθηκεύει αρχεία στο disk", "Αφαιρεί (abstracts) το data access layer", "Κάνει caching", "Διαχειρίζεται authentication"], correct: 1 },
      { q: "Πώς κάνεις register ένα generic repository στο DI;", options: ["services.AddSingleton<Repository>()", "services.AddScoped(typeof(IRepository<>), typeof(Repository<>))", "new Repository()", "Δεν γίνεται"], correct: 1 },
    ],
    starterCode: `// Υλοποίησε Factory Pattern για notifications
// Πρέπει να δημιουργεί τον σωστό notifier
// βάσει του τύπου (email, sms, push)

public interface INotification
{
    void Send(string to, string message);
}

public class EmailNotification : INotification
{
    public void Send(string to, string message)
        => Console.WriteLine(
            $"📧 Email to {to}: {message}");
}

// TODO: Φτιάξε SmsNotification και 
// PushNotification

// TODO: Φτιάξε NotificationFactory
// public static INotification Create(string type)
// που επιστρέφει το σωστό implementation

// Test:
// var notif = NotificationFactory.Create("email");
// notif.Send("user@test.com", "Hello!");`,
  },
  "1-1-0": { // C# 14
    examples: [
      {
        title: "Field-backed Properties (C# 14)",
        code: `// ΠΡΙΝ (C# 13 και παλιότερα)
public class Product_Old
{
    private string _name = "";

    public string Name
    {
        get => _name;
        set => _name = value?.Trim() 
            ?? throw new ArgumentNullException();
    }
}

// ΤΩΡΑ (C# 14) — χωρίς backing field!
public class Product
{
    public string Name
    {
        get => field;
        set => field = value?.Trim() 
            ?? throw new ArgumentNullException();
    }
    // Ο compiler δημιουργεί το 'field' αυτόματα!
}`,
        explanation: "Το keyword 'field' αναφέρεται αυτόματα στο backing field. Δεν χρειάζεσαι πλέον private _name! Πιο καθαρός κώδικας, λιγότερο boilerplate.",
      },
      {
        title: "Collection Expressions & Null-conditional Assignment",
        code: `// Collection Expressions (C# 14)
int[] numbers = [1, 2, 3, 4, 5];
List<string> names = ["Alice", "Bob", "Charlie"];

// Spread operator
int[] first = [1, 2, 3];
int[] second = [4, 5, 6];
int[] all = [..first, ..second]; // [1,2,3,4,5,6]

// Null-conditional assignment (C# 14)
class Config
{
    public string? Theme { get; set; }
    public int? FontSize { get; set; }
}

var config = new Config();

// ΠΡΙΝ
if (config != null)
    config.Theme = "dark";

// ΤΩΡΑ
config?.Theme = "dark";      // ✅ Μόνο αν != null
config?.FontSize = 16;       // ✅ Ασφαλές!

Config? nullConfig = null;
nullConfig?.Theme = "light";  // Δεν σκάει!`,
        explanation: "Collection expressions = πιο καθαρή σύνταξη για arrays/lists. Spread operator = σαν JavaScript! Null-conditional assignment = γλιτώνεις if-null checks.",
      },
    ],
    walkthrough: [
      { step: "Βήμα 1: Ενεργοποίησε C# 14", detail: "Στο .csproj: <LangVersion>14</LangVersion> ή χρησιμοποίησε .NET 10 SDK (default).", output: "<PropertyGroup>\n  <TargetFramework>net10.0</TargetFramework>\n</PropertyGroup>" },
      { step: "Βήμα 2: Δοκίμασε field keyword", detail: "Αντικατέστησε κάθε private backing field με field στο property.", output: "public string Name { get => field; set => field = value.Trim(); }" },
      { step: "Βήμα 3: Χρησιμοποίησε collection expressions", detail: "Αντικατέστησε new int[] { 1, 2, 3 } με [1, 2, 3] και new List<T>() με [].", output: "List<string> items = [\"a\", \"b\", \"c\"];" },
      { step: "Βήμα 4: Null-conditional assignment", detail: "Αντικατέστησε if (x != null) x.Prop = val; με x?.Prop = val;", output: "user?.Email = newEmail; // Safe!" },
    ],
    quiz: [
      { q: "Τι κάνει το keyword 'field' στο C# 14;", options: ["Δηλώνει ένα πεδίο σε database", "Αναφέρεται αυτόματα στο backing field ενός property", "Είναι νέος τύπος δεδομένων", "Δημιουργεί ένα readonly field"], correct: 1 },
      { q: "Πώς γράφουμε [1, 2, ..other] στο C# 14;", options: ["Concat operator", "Spread operator σε collection expression", "Tuple unpacking", "Δεν γίνεται σε C#"], correct: 1 },
      { q: "Τι κάνει το config?.Theme = \"dark\";", options: ["Πάντα κάνει assignment", "Assignment μόνο αν config != null", "Ρίχνει exception αν null", "Δημιουργεί νέο config"], correct: 1 },
    ],
    starterCode: `// Μετέτρεψε αυτόν τον κώδικα σε C# 14!
// Χρησιμοποίησε: field keyword, collection 
// expressions, null-conditional assignment

public class UserProfile
{
    // TODO: Χρησιμοποίησε field keyword
    private string _displayName = "";
    public string DisplayName
    {
        get => _displayName;
        set => _displayName = value?.Trim() ?? "";
    }

    // TODO: Χρησιμοποίησε collection expression
    public List<string> GetDefaultTags()
    {
        return new List<string> 
        { 
            "user", "active", "default" 
        };
    }

    // TODO: Χρησιμοποίησε null-conditional
    public void UpdateSettings(Settings? settings)
    {
        if (settings != null)
        {
            settings.Theme = "modern";
            settings.Language = "el";
        }
    }
}`,
  },
  "1-1-1": { // ASP.NET Core 10
    examples: [
      {
        title: "Minimal API — Πλήρες CRUD",
        code: `// Program.cs — ASP.NET Core 10 Minimal API
var builder = WebApplication.CreateBuilder(args);

// DI Registration
builder.Services.AddDbContext<AppDb>(opt => 
    opt.UseNpgsql(
        builder.Configuration
            .GetConnectionString("Default")));
builder.Services.AddScoped<IBookRepository, 
    BookRepository>();

var app = builder.Build();

// Endpoints — Clean & Minimal!
var books = app.MapGroup("/api/books")
    .WithTags("Books");

books.MapGet("/", async (IBookRepository repo) =>
    Results.Ok(await repo.GetAllAsync()));

books.MapGet("/{id:int}", async (
    int id, IBookRepository repo) =>
    await repo.GetByIdAsync(id) is Book book
        ? Results.Ok(book)
        : Results.NotFound());

books.MapPost("/", async (
    CreateBookDto dto, 
    IBookRepository repo) =>
{
    var book = await repo.CreateAsync(dto);
    return Results.Created(
        $"/api/books/{book.Id}", book);
});

books.MapPut("/{id:int}", async (
    int id, UpdateBookDto dto, 
    IBookRepository repo) =>
{
    var book = await repo.UpdateAsync(id, dto);
    return book is null 
        ? Results.NotFound() 
        : Results.Ok(book);
});

books.MapDelete("/{id:int}", async (
    int id, IBookRepository repo) =>
{
    await repo.DeleteAsync(id);
    return Results.NoContent();
});

app.Run();`,
        explanation: "Minimal APIs στο .NET 10: MapGroup για routing, pattern matching (is Book book), Results helpers. Πολύ λιγότερο boilerplate από Controllers!",
      },
      {
        title: "Custom Middleware",
        code: `// Middleware για request logging & timing
public class RequestTimingMiddleware(
    RequestDelegate next,
    ILogger<RequestTimingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext ctx)
    {
        var sw = Stopwatch.StartNew();
        var path = ctx.Request.Path;
        var method = ctx.Request.Method;

        try
        {
            await next(ctx); // Κάλεσε τον επόμενο
            sw.Stop();

            logger.LogInformation(
                "{Method} {Path} → {Status} ({Ms}ms)",
                method, path, 
                ctx.Response.StatusCode,
                sw.ElapsedMilliseconds);
        }
        catch (Exception ex)
        {
            sw.Stop();
            logger.LogError(ex,
                "{Method} {Path} → FAILED ({Ms}ms)",
                method, path, 
                sw.ElapsedMilliseconds);
            throw; // Re-throw
        }
    }
}

// Registration στο Program.cs:
app.UseMiddleware<RequestTimingMiddleware>();`,
        explanation: "Τα Middleware είναι σαν φίλτρα: τρέχουν πριν ΚΑΙ μετά από κάθε request. Ιδανικά για logging, auth, error handling, CORS.",
      },
    ],
    walkthrough: [
      { step: "Βήμα 1: dotnet new webapi", detail: "Δημιούργησε νέο project: dotnet new webapi -n MyApi --use-minimal-apis", output: "Project created: MyApi/" },
      { step: "Βήμα 2: Πρόσθεσε model & DbContext", detail: "Δημιούργησε Book entity + AppDbContext + connection string.", output: "public class Book { public int Id; public string Title; public string Author; }" },
      { step: "Βήμα 3: MapGroup endpoints", detail: "app.MapGroup(\"/api/books\") + MapGet/MapPost/MapPut/MapDelete.", output: "GET /api/books → 200 OK [{...}, {...}]" },
      { step: "Βήμα 4: Test με HTTP file", detail: "Δημιούργησε .http αρχείο στο VS Code ή χρησιμοποίησε Swagger UI.", output: "POST /api/books → 201 Created { \"id\": 1 }" },
    ],
    quiz: [
      { q: "Τι κάνει το MapGroup στο Minimal API;", options: ["Δημιουργεί database tables", "Ομαδοποιεί endpoints κάτω από κοινό prefix", "Ενεργοποιεί authentication", "Δημιουργεί middleware"], correct: 1 },
      { q: "Τι είναι η σειρά εκτέλεσης στο middleware pipeline;", options: ["Τυχαία", "FIFO — πρώτο registered = πρώτο εκτελείται", "LIFO — τελευταίο registered = πρώτο εκτελείται", "Βάσει priority"], correct: 1 },
      { q: "Πώς γυρνάς 201 Created σε Minimal API;", options: ["return Ok()", "return Results.Created(url, object)", "return StatusCode(201)", "return Created()"], correct: 1 },
    ],
    starterCode: `// Φτιάξε ένα Todo API με Minimal APIs!
// Endpoints: GET /todos, GET /todos/{id}, 
// POST /todos, PUT /todos/{id}, DELETE /todos/{id}

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// In-memory storage
var todos = new List<Todo>();
var nextId = 1;

record Todo(int Id, string Title, bool Done);
record CreateTodoDto(string Title);

// TODO: Πρόσθεσε τα endpoints εδώ!
// Hint: app.MapGet("/todos", () => ...);
// Hint: app.MapPost("/todos", (CreateTodoDto dto) => ...);

app.Run();`,
  },
};

// ─── COMPONENTS ────────────────────────────────────────
const TAB = { examples: "💻 Examples", walkthrough: "🚶 Walkthrough", quiz: "❓ Quiz", editor: "✏️ Live Editor" };

function CodeBlock({ code, title }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div style={{ marginBottom: 12 }}>
      {title && <div style={{ fontSize: 15, fontWeight: 700, color: "#fbbf24", marginBottom: 8 }}>{title}</div>}
      <div style={{ position: "relative", background: "#0d1117", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <button onClick={copy} style={{ position: "absolute", top: 6, right: 6, fontSize: 10, padding: "3px 8px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: copied ? "#22c55e" : "#64748b", cursor: "pointer", zIndex: 2 }}>
          {copied ? "✓ Copied" : "Copy"}
        </button>
        <pre style={{ margin: 0, padding: "16px 16px", fontSize: 13, lineHeight: 1.6, color: "#c9d1d9", overflowX: "auto", fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', monospace", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{code}</pre>
      </div>
    </div>
  );
}

function ExamplesTab({ data }) {
  const [activeEx, setActiveEx] = useState(0);
  const ex = data.examples[activeEx];
  return (
    <div>
      <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
        {data.examples.map((e, i) => (
          <button key={i} onClick={() => setActiveEx(i)} style={{ fontSize: 10, padding: "4px 10px", borderRadius: 6, border: "none", background: i === activeEx ? "rgba(14,165,233,0.2)" : "rgba(255,255,255,0.04)", color: i === activeEx ? "#38bdf8" : "#64748b", cursor: "pointer", fontWeight: 600 }}>
            {e.title.substring(0, 30)}{e.title.length > 30 ? "..." : ""}
          </button>
        ))}
      </div>
      <CodeBlock code={ex.code} title={ex.title} />
      <div style={{ padding: "12px 16px", background: "rgba(14,165,233,0.06)", borderRadius: 8, borderLeft: "3px solid #0ea5e9" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#38bdf8", marginBottom: 6 }}>💡 ΕΠΕΞΗΓΗΣΗ</div>
        <div style={{ fontSize: 15, color: "#cbd5e1", lineHeight: 1.7 }}>{ex.explanation}</div>
      </div>
    </div>
  );
}

function WalkthroughTab({ data }) {
  const [step, setStep] = useState(0);
  const w = data.walkthrough;
  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 12, alignItems: "center" }}>
        {w.map((_, i) => (
          <div key={i} onClick={() => setStep(i)} style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, cursor: "pointer", background: i === step ? "#0ea5e9" : i < step ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.06)", color: i === step ? "#fff" : i < step ? "#22c55e" : "#64748b", border: i === step ? "2px solid #0ea5e9" : "2px solid transparent", transition: "all 0.2s" }}>
            {i < step ? "✓" : i + 1}
          </div>
        ))}
        <div style={{ flex: 1, height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 1 }} />
      </div>
      <div style={{ padding: 14, background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0", marginBottom: 8 }}>{w[step].step}</div>
        <div style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.7, marginBottom: 12 }}>{w[step].detail}</div>
        <div style={{ padding: "8px 12px", background: "#0d1117", borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize: 9, color: "#22c55e", fontWeight: 700, marginBottom: 4 }}>OUTPUT:</div>
          <pre style={{ margin: 0, fontSize: 13, color: "#c9d1d9", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>{w[step].output}</pre>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} style={{ fontSize: 11, padding: "5px 14px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: step === 0 ? "#333" : "#94a3b8", cursor: step === 0 ? "default" : "pointer" }}>← Πίσω</button>
        <span style={{ fontSize: 11, color: "#475569" }}>{step + 1} / {w.length}</span>
        <button onClick={() => setStep(Math.min(w.length - 1, step + 1))} disabled={step === w.length - 1} style={{ fontSize: 11, padding: "5px 14px", borderRadius: 6, border: "none", background: step === w.length - 1 ? "#1e293b" : "#0ea5e9", color: "#fff", cursor: step === w.length - 1 ? "default" : "pointer" }}>Επόμενο →</button>
      </div>
    </div>
  );
}

function QuizTab({ data, itemKey, quizState, setQuizState }) {
  const [current, setCurrent] = useState(0);
  const state = quizState[itemKey] || {};
  const quiz = data.quiz;
  const q = quiz[current];
  const answered = state[current] !== undefined;
  const correct = state[current] === q.correct;
  const score = Object.values(state).filter((v, i) => v === quiz[i]?.correct).length;

  const answer = (idx) => {
    if (answered) return;
    setQuizState({ ...quizState, [itemKey]: { ...state, [current]: idx } });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: "#64748b" }}>Ερώτηση {current + 1}/{quiz.length}</span>
        <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 600 }}>Score: {score}/{Object.keys(state).length}</span>
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, color: "#e2e8f0", marginBottom: 16, lineHeight: 1.5 }}>{q.q}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {q.options.map((opt, i) => {
          let bg = "rgba(255,255,255,0.04)";
          let border = "rgba(255,255,255,0.06)";
          let col = "#cbd5e1";
          if (answered) {
            if (i === q.correct) { bg = "rgba(34,197,94,0.15)"; border = "rgba(34,197,94,0.4)"; col = "#4ade80"; }
            else if (i === state[current] && i !== q.correct) { bg = "rgba(239,68,68,0.15)"; border = "rgba(239,68,68,0.4)"; col = "#f87171"; }
            else { col = "#475569"; }
          }
          return (
            <button key={i} onClick={() => answer(i)} style={{ padding: "12px 16px", borderRadius: 10, border: `1px solid ${border}`, background: bg, color: col, fontSize: 15, cursor: answered ? "default" : "pointer", textAlign: "left", transition: "all 0.2s", fontWeight: answered && i === q.correct ? 600 : 400 }}>
              {String.fromCharCode(65 + i)}. {opt} {answered && i === q.correct && " ✓"} {answered && i === state[current] && i !== q.correct && " ✗"}
            </button>
          );
        })}
      </div>
      {answered && (
        <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 6, background: correct ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", fontSize: 12, color: correct ? "#4ade80" : "#f87171" }}>
          {correct ? "🎉 Σωστά!" : `Η σωστή απάντηση είναι: ${String.fromCharCode(65 + q.correct)}. ${q.options[q.correct]}`}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
        <button onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0} style={{ fontSize: 11, padding: "5px 14px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: current === 0 ? "#333" : "#94a3b8", cursor: current === 0 ? "default" : "pointer" }}>←</button>
        <button onClick={() => setCurrent(Math.min(quiz.length - 1, current + 1))} disabled={current === quiz.length - 1} style={{ fontSize: 11, padding: "5px 14px", borderRadius: 6, border: "none", background: current === quiz.length - 1 ? "#1e293b" : "#0ea5e9", color: "#fff", cursor: current === quiz.length - 1 ? "default" : "pointer" }}>→</button>
      </div>
    </div>
  );
}

function LiveEditorTab({ data }) {
  const [code, setCode] = useState(data.starterCode);
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => {
    try { return localStorage.getItem("roadmap:apikey") || ""; } catch { return ""; }
  });
  const [showKeyInput, setShowKeyInput] = useState(false);
  const taRef = useRef(null);

  const saveKey = (k) => {
    setApiKey(k);
    try { localStorage.setItem("roadmap:apikey", k); } catch {}
  };

  const runCode = async () => {
    if (!apiKey) {
      setShowKeyInput(true);
      setOutput("⚠️ Χρειάζεσαι Anthropic API key για AI review.\nΠάρε ένα δωρεάν από: https://console.anthropic.com\nΉ αντέγραψε τον κώδικα και δοκίμασέ τον στο dotnet CLI!");
      return;
    }
    setLoading(true);
    setOutput(null);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: `You are a C# code reviewer and executor. The user wrote this C# code as a learning exercise. Do THREE things:
1. Show what the OUTPUT would be if this code ran (simulate it)
2. Point out any ERRORS or issues (be specific, with line references)
3. Give a brief GRADE (⭐ to ⭐⭐⭐⭐⭐) and ONE tip to improve

Format your response EXACTLY as:
OUTPUT:
[simulated output or "Compilation error: ..."]

REVIEW:
[errors/issues found, or "✅ No issues found!"]

GRADE: [stars]
TIP: [one actionable tip]

Keep it short and in a mix of Greek and English (technical terms in English). Here's the code:
\`\`\`csharp
${code}
\`\`\`` }],
        }),
      });
      const result = await response.json();
      if (result.error) {
        setOutput(`⚠️ API Error: ${result.error.message}\nΈλεγξε το API key σου.`);
      } else {
        const text = result.content?.map(c => c.text || "").join("") || "Σφάλμα κατά την εκτέλεση.";
        setOutput(text);
      }
    } catch (e) {
      setOutput("⚠️ Δεν ήταν δυνατή η σύνδεση. Έλεγξε το internet ή το API key σου.");
    }
    setLoading(false);
  };

  const reset = () => setCode(data.starterCode);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#38bdf8" }}>✏️ Γράψε & τρέξε κώδικα C#</span>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={reset} style={{ fontSize: 10, padding: "3px 10px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#64748b", cursor: "pointer" }}>↺ Reset</button>
          <button onClick={runCode} disabled={loading} style={{ fontSize: 10, padding: "3px 12px", borderRadius: 5, border: "none", background: loading ? "#1e293b" : "#22c55e", color: loading ? "#64748b" : "#000", cursor: loading ? "default" : "pointer", fontWeight: 700 }}>
            {loading ? "⏳ Analyzing..." : "▶ Run & Review"}
          </button>
        </div>
      </div>
      <textarea
        ref={taRef}
        value={code}
        onChange={e => setCode(e.target.value)}
        spellCheck={false}
        style={{ width: "100%", minHeight: 260, padding: 16, borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "#0d1117", color: "#c9d1d9", fontFamily: "'Cascadia Code', 'Fira Code', monospace", fontSize: 14, lineHeight: 1.6, resize: "vertical", outline: "none", boxSizing: "border-box", tabSize: 4 }}
        onKeyDown={e => {
          if (e.key === "Tab") {
            e.preventDefault();
            const ta = taRef.current;
            const start = ta.selectionStart;
            const end = ta.selectionEnd;
            setCode(code.substring(0, start) + "    " + code.substring(end));
            setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 4; }, 0);
          }
        }}
      />
      {/* API Key input */}
      {showKeyInput && !apiKey && (
        <div style={{ marginTop: 8, padding: 10, borderRadius: 8, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
          <div style={{ fontSize: 11, color: "#fbbf24", marginBottom: 6, fontWeight: 600 }}>🔑 Anthropic API Key (προαιρετικό)</div>
          <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 6 }}>Για AI code review. Το key αποθηκεύεται μόνο τοπικά στο browser σου.</div>
          <div style={{ display: "flex", gap: 4 }}>
            <input
              type="password"
              placeholder="sk-ant-..."
              onChange={e => saveKey(e.target.value)}
              style={{ flex: 1, padding: "6px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "#0d1117", color: "#c9d1d9", fontSize: 11, fontFamily: "monospace", outline: "none" }}
            />
            <button onClick={() => setShowKeyInput(false)} style={{ fontSize: 10, padding: "4px 10px", borderRadius: 6, border: "none", background: "rgba(255,255,255,0.06)", color: "#64748b", cursor: "pointer" }}>Κλείσε</button>
          </div>
        </div>
      )}
      {apiKey && (
        <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10, color: "#22c55e" }}>🔑 API Key: ✓ αποθηκευμένο</span>
          <button onClick={() => { saveKey(""); setShowKeyInput(true); }} style={{ fontSize: 9, color: "#ef4444", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Αφαίρεση</button>
        </div>
      )}
      {output && (
        <div style={{ marginTop: 8, padding: 12, borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#22c55e", marginBottom: 6 }}>🤖 AI CODE REVIEW</div>
          <pre style={{ margin: 0, fontSize: 11, color: "#cbd5e1", fontFamily: "monospace", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{output}</pre>
        </div>
      )}
    </div>
  );
}

// ─── MAIN PHASES DATA (simplified for items) ───────────
const phases = [
  {
    id: 1, title: "Φάση 1", subtitle: "Θεωρητικό Υπόβαθρο & .NET 10", duration: "2-3 μήνες", color: "#0ea5e9", icon: "🧠",
    sections: [
      {
        name: "Θεωρία Προγραμματισμού",
        items: [
          { topic: "SOLID Principles", desc: "SRP, OCP, LSP, ISP, DIP — οι 5 αρχές σχεδίασης", type: "theory" },
          { topic: "Design Patterns", desc: "Factory, Strategy, Observer, Repository, DI", type: "theory" },
          { topic: "Clean Architecture", desc: "Layers, separation of concerns, domain-driven", type: "theory" },
          { topic: "Data Structures & Algorithms", desc: "Lists, Dictionaries, Big-O, LINQ internals", type: "theory" },
        ],
      },
      {
        name: ".NET 10 & C# 14",
        items: [
          { topic: "C# 14 νέα features", desc: "Field keyword, collection expressions, null-conditional assignment", type: "practice" },
          { topic: "ASP.NET Core 10", desc: "Minimal APIs, middleware, DI, configuration", type: "practice" },
          { topic: "Entity Framework Core 10", desc: "Code-first, migrations, LINQ, JSON columns", type: "practice" },
          { topic: "Aspire", desc: "Cloud-native orchestration, service discovery", type: "practice" },
        ],
      },
    ],
  },
  {
    id: 2, title: "Φάση 2", subtitle: "TypeScript & Next.js", duration: "2-3 μήνες", color: "#8b5cf6", icon: "⚡",
    sections: [{ name: "Σύντομα...", items: [{ topic: "TypeScript & Next.js", desc: "Θα ενεργοποιηθεί μόλις ολοκληρώσεις τη Φάση 1!", type: "theory" }] }],
  },
  {
    id: 3, title: "Φάση 3", subtitle: "Kotlin", duration: "2-3 μήνες", color: "#f59e0b", icon: "📱",
    sections: [{ name: "Σύντομα...", items: [{ topic: "Kotlin & Android", desc: "Θα ενεργοποιηθεί μόλις ολοκληρώσεις τη Φάση 2!", type: "theory" }] }],
  },
  {
    id: 4, title: "Φάση 4", subtitle: "Advanced & DevOps", duration: "Συνεχής", color: "#ef4444", icon: "🚀",
    sections: [{ name: "Σύντομα...", items: [{ topic: "Microservices & DevOps", desc: "Το τελικό βήμα — testing, Docker, CI/CD, cloud", type: "theory" }] }],
  },
];

const typeColors = {
  theory: { bg: "rgba(139,92,246,0.12)", text: "#a78bfa", label: "Θεωρία" },
  practice: { bg: "rgba(14,165,233,0.12)", text: "#38bdf8", label: "Πράξη" },
  project: { bg: "rgba(245,158,11,0.12)", text: "#fbbf24", label: "Project" },
};

// ─── MAIN APP ──────────────────────────────────────────
export default function App() {
  const [activePhase, setActivePhase] = useState(0);
  const [completed, setCompleted] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [activeTab, setActiveTab] = useState({});
  const [quizState, setQuizState] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("roadmap-v3");
        if (r?.value) {
          const d = JSON.parse(r.value);
          setCompleted(d.completed || {});
          setQuizState(d.quizState || {});
        }
      } catch (e) {}
      setLoaded(true);
    })();
  }, []);

  const save = useCallback(async (c, q) => {
    try { await window.storage.set("roadmap-v3", JSON.stringify({ completed: c, quizState: q })); } catch (e) {}
  }, []);

  const toggle = (key) => {
    const next = { ...completed, [key]: !completed[key] };
    setCompleted(next);
    save(next, quizState);
  };

  const updateQuiz = (newQ) => {
    setQuizState(newQ);
    save(completed, newQ);
  };

  const totalProgress = () => {
    let t = 0, d = 0;
    phases.forEach(p => p.sections.forEach((s, si) => s.items.forEach((_, ii) => { t++; if (completed[`${p.id}-${si}-${ii}`]) d++; })));
    return t > 0 ? Math.round((d / t) * 100) : 0;
  };

  const phaseProgress = (p) => {
    let t = 0, d = 0;
    p.sections.forEach((s, si) => s.items.forEach((_, ii) => { t++; if (completed[`${p.id}-${si}-${ii}`]) d++; }));
    return t > 0 ? Math.round((d / t) * 100) : 0;
  };

  const phase = phases[activePhase];

  if (!loaded) return <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontFamily: "system-ui", fontSize: 18 }}>Φόρτωση...</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e2e8f0", fontFamily: "'Segoe UI', system-ui, sans-serif", padding: "32px 24px", maxWidth: 1080, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 36, textAlign: "center" }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, background: "linear-gradient(135deg, #0ea5e9, #8b5cf6, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0 }}>Developer Roadmap</h1>
        <p style={{ color: "#64748b", fontSize: 16, marginTop: 8 }}>Interactive Learning • .NET 10 → TypeScript → Kotlin</p>
        <div style={{ marginTop: 18, display: "inline-flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "10px 22px", border: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontSize: 15, color: "#94a3b8" }}>Πρόοδος</span>
          <div style={{ width: 140, height: 7, borderRadius: 4, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{ width: `${totalProgress()}%`, height: "100%", borderRadius: 4, background: "linear-gradient(90deg, #0ea5e9, #8b5cf6)", transition: "width 0.4s" }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700 }}>{totalProgress()}%</span>
        </div>
        <div style={{ marginTop: 6, fontSize: 13, color: "#22c55e" }}>✅ Auto-save ενεργό</div>
      </div>

      {/* Phase tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 26 }}>
        {phases.map((p, i) => {
          const active = i === activePhase;
          return (
            <button key={p.id} onClick={() => { setActivePhase(i); setExpanded(null); }} style={{ flex: "1 1 0", padding: "14px 8px", borderRadius: 12, border: `2px solid ${active ? p.color : "rgba(255,255,255,0.06)"}`, background: active ? `${p.color}11` : "rgba(255,255,255,0.02)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 24 }}>{p.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: active ? p.color : "#64748b" }}>{p.title}</span>
              <span style={{ fontSize: 11, color: active ? "#cbd5e1" : "#475569", textAlign: "center" }}>{p.subtitle}</span>
              <div style={{ width: "80%", height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", marginTop: 4 }}>
                <div style={{ width: `${phaseProgress(p)}%`, height: "100%", borderRadius: 2, background: p.color, transition: "width 0.3s" }} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Phase header */}
      <div style={{ marginBottom: 22, padding: "16px 22px", borderRadius: 14, background: `linear-gradient(135deg, ${phase.color}15, transparent)`, border: `1px solid ${phase.color}30` }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: phase.color }}>{phase.icon} {phase.subtitle}</h2>
        <span style={{ fontSize: 15, color: "#64748b" }}>{phase.duration} • Πάτα σε κάθε θέμα για examples, quiz & live editor</span>
      </div>

      {/* Items */}
      {phase.sections.map((section, si) => (
        <div key={si} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 10px 4px" }}>{section.name}</h3>
          {section.items.map((item, ii) => {
            const key = `${phase.id}-${si}-${ii}`;
            const done = completed[key];
            const ts = typeColors[item.type];
            const isExp = expanded === key;
            const hasContent = !!codeExamples[key];
            const curTab = activeTab[key] || "examples";

            return (
              <div key={ii} style={{ marginBottom: 8, borderRadius: 12, background: done ? "rgba(34,197,94,0.04)" : "rgba(255,255,255,0.02)", border: `1px solid ${isExp ? `${phase.color}40` : done ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.05)"}`, overflow: "hidden", transition: "all 0.2s" }}>
                <div style={{ padding: "14px 18px", display: "flex", gap: 12, alignItems: "flex-start", cursor: hasContent ? "pointer" : "default" }} onClick={() => hasContent && setExpanded(isExp ? null : key)}>
                  <div onClick={e => { e.stopPropagation(); toggle(key); }} style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${done ? "#22c55e" : "rgba(255,255,255,0.15)"}`, background: done ? "#22c55e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2, cursor: "pointer" }}>
                    {done && <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="#0a0a0f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 17, fontWeight: 600, color: done ? "#64748b" : "#e2e8f0", textDecoration: done ? "line-through" : "none" }}>{item.topic}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4, background: ts.bg, color: ts.text, textTransform: "uppercase" }}>{ts.label}</span>
                      {hasContent && <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, background: "rgba(34,197,94,0.1)", color: "#4ade80", fontWeight: 600 }}>INTERACTIVE</span>}
                    </div>
                    <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b", lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                  {hasContent && <div style={{ color: "#475569", fontSize: 14, transform: isExp ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", marginTop: 5 }}>▼</div>}
                </div>

                {isExp && hasContent && (() => {
                  const cd = codeExamples[key];
                  return (
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "0 18px 18px" }}>
                      <div style={{ display: "flex", gap: 6, padding: "14px 0 12px", flexWrap: "wrap" }}>
                        {["examples", "walkthrough", "quiz", "editor"].map(t => (
                          <button key={t} onClick={() => setActiveTab({ ...activeTab, [key]: t })} style={{
                            fontSize: 13, padding: "6px 16px", borderRadius: 8, border: "none",
                            background: curTab === t
                              ? t === "quiz" ? "rgba(245,158,11,0.2)" : t === "editor" ? "rgba(34,197,94,0.2)" : "rgba(14,165,233,0.2)"
                              : "rgba(255,255,255,0.04)",
                            color: curTab === t
                              ? t === "quiz" ? "#fbbf24" : t === "editor" ? "#4ade80" : "#38bdf8"
                              : "#64748b",
                            cursor: "pointer", fontWeight: 600,
                          }}>{TAB[t]}</button>
                        ))}
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.015)", borderRadius: 10, padding: 18 }}>
                        {curTab === "examples" && <ExamplesTab data={cd} />}
                        {curTab === "walkthrough" && <WalkthroughTab data={cd} />}
                        {curTab === "quiz" && <QuizTab data={cd} itemKey={key} quizState={quizState} setQuizState={updateQuiz} />}
                        {curTab === "editor" && <LiveEditorTab data={cd} />}
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
      ))}

      <div style={{ marginTop: 26, padding: 18, borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", textAlign: "center", fontSize: 14, color: "#64748b" }}>
        💡 Θέματα με <span style={{ color: "#4ade80" }}>INTERACTIVE</span> tag έχουν: code examples, walkthrough, quiz & live editor
      </div>
    </div>
  );
}

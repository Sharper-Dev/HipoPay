using HipoPay.Dbs;
using HipoPay.Services;
var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("Payments") ?? "Data Source=payments.db";

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSqlite<PaymentsDb>(connectionString);
builder.Services.AddOpenApi();
builder.Services.AddScoped<PaymentService>();
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/error");
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Map("/error", () => Results.Problem(
    title: "An error occurred while processing your request.",
    statusCode: 500
));

app.Run();
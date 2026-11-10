using Nexora.Worker;
using Serilog;

var builder = Host.CreateApplicationBuilder(args);

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] (Worker) {Message:lj}{NewLine}{Exception}")
    .CreateLogger();

builder.Services.AddSerilog();
builder.Services.AddHostedService<Worker>();

var host = builder.Build();
host.Run();

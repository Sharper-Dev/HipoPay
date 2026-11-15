using Microsoft.EntityFrameworkCore;
using HipoPay.Models;

namespace HipoPay.Dbs
{
    public class PaymentsDb : DbContext
    {
        public PaymentsDb(DbContextOptions<PaymentsDb> options) : base(options)
        {
        }
        public DbSet<Payment> Payments { get; set; } = null!;
    }
}
using Microsoft.EntityFrameworkCore;
using HipoPay.Models;

namespace HipoPay.Dbs
{
    public class TransactionsDb : DbContext
    {
        public TransactionsDb(DbContextOptions<TransactionsDb> options) : base(options)
        {
        }
        public DbSet<Transaction> Transactions { get; set; } = null!;
    }
}
namespace HipoPay.Models
{
    public class Transaction
    {
        public int Id { get; set; }
        public string? Status { get; set; }
        public decimal Amount { get; set; }
        public string? Description { get; set; }
        public string? Token { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
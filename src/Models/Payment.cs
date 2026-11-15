namespace HipoPay.Models
{
    public class Payment
    {
        public int Id { get; set; }
        public string? Receiver { get; set; }
        public string? Sender { get; set; }
        public string? Status { get; set; }
        public decimal Amount { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}

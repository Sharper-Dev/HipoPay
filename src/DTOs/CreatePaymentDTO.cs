namespace HipoPay.DTOs
{
    public class CreatePaymentDTO
    {
        public decimal Amount { get; set; }
        public string? Description { get; set; }
    }
}
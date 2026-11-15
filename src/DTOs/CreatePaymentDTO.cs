using System.ComponentModel.DataAnnotations;

namespace HipoPay.DTOs
{
    public class CreatePaymentDTO
    {
        [Required(ErrorMessage = "Receiver is required")]
        public string Receiver { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Sender is required")]
        public string Sender { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Amount is required")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be a positive value")]
        public decimal Amount { get; set; }
        
        [Required(ErrorMessage = "Description is required")]
        [StringLength(200, ErrorMessage = "Description cannot exceed 200 characters")]
        public string? Description { get; set; }
    }
}
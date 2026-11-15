using Microsoft.AspNetCore.Mvc;
using HipoPay.Dbs;
using HipoPay.DTOs;
using HipoPay.Models;
using HipoPay.Services;

namespace HipoPay.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly PaymentService PaymentService;

        public PaymentController(PaymentService paymentService)
        {
            PaymentService = paymentService;
        }
        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Payment>>> GetAll()
        {
            var payments = await PaymentService.GetAllPaymentsAsync();
            return Ok(payments);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Payment>> GetById(int id)
        {
            var payment = await PaymentService.GetPaymentByIdAsync(id);
            if (payment == null)
            {
                return NotFound( new { message = $"Payment with id {id} not found" });
            }
            return Ok(payment);
        }

        [HttpPost]
        public async Task<ActionResult<Payment>> CreatePayment([FromBody] CreatePaymentDTO paymentDTO)
        {
            var newPayment = new Payment
            {
                Status = "Completed",
                Sender = paymentDTO.Sender,
                Receiver = paymentDTO.Receiver,
                Amount = paymentDTO.Amount,
                Description = paymentDTO.Description,
                CreatedAt = DateTime.UtcNow
            };
            var createdPayment = await PaymentService.CreatePaymentAsync(newPayment);
            return Created();
        }
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeletePayment(int id)
        {
            var deleted = await PaymentService.DeletePaymentAsync(id);
            if (!deleted) return NotFound(new { message = $"Payment with id {id} not found" });

            return Ok(new { message = $"Payment with id {id} deleted successfully" });
        }
        // [HttpPut("{id}")]
        // public IActionResult UpdatePayment(int id, [FromBody] UpdatePaymentDTO payment)
        // {
        //     return Ok(new { message = $"Update payment by id: {id}", payment });
        // }
    }
}

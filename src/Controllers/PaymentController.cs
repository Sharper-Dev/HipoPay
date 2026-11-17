using Microsoft.AspNetCore.Mvc;
using HipoPay.Dbs;
using HipoPay.DTOs;
using HipoPay.Models;
using HipoPay.Services;
using Microsoft.AspNetCore.Authorization;

namespace HipoPay.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly PaymentService PaymentService;

        public PaymentController(PaymentService paymentService)
        {
            PaymentService = paymentService;
        }

        [Authorize(Roles = "Admin,Guest")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Payment>>> GetAll()
        {
            var payments = await PaymentService.GetAllPaymentsAsync();
            return Ok(payments);
        }

        [Authorize(Roles = "Admin,Guest")]
        [HttpGet("{id}")]
        public async Task<ActionResult<Payment>> GetById(int id)
        {
            var payment = await PaymentService.GetPaymentByIdAsync(id);
            if (payment == null)
            {
                return NotFound(new { message = $"Payment with id {id} not found" });
            }
            return Ok(payment);
        }

        [Authorize(Roles = "Admin,Guest")]
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
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeletePayment(int id)
        {
            var deleted = await PaymentService.DeletePaymentAsync(id);
            if (!deleted) return NotFound(new { message = $"Payment with id {id} not found" });

            return Ok(new { message = $"Payment with id {id} deleted successfully" });
        }
    }
}

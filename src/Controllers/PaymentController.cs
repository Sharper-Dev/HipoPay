using Microsoft.AspNetCore.Mvc;
using HipoPay.Dbs;
using HipoPay.DTOs;

namespace HipoPay.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        [HttpGet]
        public ActionResult<TransactionsDb> GetAll()
        {
            return Ok(new { message = "Get all payments" });
        }

        [HttpGet("{id}")]
        public ActionResult<TransactionsDb> GetById(int id)
        {
            return Ok(new { message = $"Get payment by id: {id}" });
        }

        [HttpPost]
        public IActionResult CreatePayment([FromBody] CreatePaymentDTO payment)
        {
            return Ok(new { message = "Create payment", payment });
        }
        [HttpDelete("{id}")]
        public IActionResult DeletePayment(int id)
        {
            return Ok(new { message = $"Delete payment by id: {id}" });
        }
        // [HttpPut("{id}")]
        // public IActionResult UpdatePayment(int id, [FromBody] UpdatePaymentDTO payment)
        // {
        //     return Ok(new { message = $"Update payment by id: {id}", payment });
        // }
    }
}

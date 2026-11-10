using Microsoft.AspNetCore.Mvc;
using HipoPay.Dbs;
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
    }
}
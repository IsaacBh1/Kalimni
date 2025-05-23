using System.Security.Claims;
using ChatApp_Backend.Data;
using ChatApp_Backend.Features.Messages.Dtos;
using ChatApp_Backend.Hubs;
using ChatApp_Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class MessagesController : ControllerBase
{
    private readonly ChatDbContext _context;
    private readonly IHubContext<ChatHub> _hubContext;

    public MessagesController(ChatDbContext context, IHubContext<ChatHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserMessages(int userId)
    {
        var messages = await _context.Messages
            .Include(m => m.Sender)
            .Include(m => m.Receiver)
            .Where(m => m.SenderId == userId || m.ReceiverId == userId)
            .OrderBy(m => m.SentAt)
            .ToListAsync();

        return Ok(messages);
    }

    [HttpPost]
    public async Task<IActionResult> SendMessage([FromBody] MessageCreateDto dto)
    {
        var nameIdentifier = User?.FindFirstValue("id");
        if (string.IsNullOrEmpty(nameIdentifier))
        {
            return BadRequest("User identifier is missing.");
        }
        var senderId = int.Parse(nameIdentifier);
        var receiverExists = await _context.Users.AnyAsync(u => u.Id == dto.ReceiverId);
        if (!receiverExists)
        {
            return BadRequest("Receiver does not exist.");
        }

        if (dto.GroupId.HasValue)
        {
            var groupExists = await _context.Groups.AnyAsync(g => g.Id == dto.GroupId.Value);
            if (!groupExists)
            {
                return BadRequest("Group does not exist.");
            }
        }

        var message = new Message
        {
            Text = dto.Text,
            SenderId = senderId,
            ReceiverId = dto.ReceiverId,
            GroupId = dto.GroupId,
            SentAt = DateTime.UtcNow,
            IsRead = false
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        if (dto.GroupId.HasValue)
        {
            await _hubContext.Clients.Group($"Group_{dto.GroupId}")
                .SendAsync("ReceiveMessage", new
                {
                    message.Id,
                    message.Text,
                    message.SentAt,
                    message.SenderId,
                    message.ReceiverId,
                    message.IsRead,
                    message.GroupId
                });
        }
        else
        {
            await _hubContext.Clients.Users(dto.SenderId.ToString(), dto.ReceiverId.ToString())
                .SendAsync("ReceiveMessage", new
                {
                    message.Id,
                    message.Text,
                    message.SentAt,
                    message.SenderId,
                    message.ReceiverId,
                    message.IsRead,
                    message.GroupId
                });
        }

        return CreatedAtAction(nameof(GetUserMessages), new { userId = senderId }, new
        {
            message.Id,
            message.Text,
            message.SentAt,
            message.SenderId,
            message.ReceiverId,
            message.IsRead,
            message.GroupId
        });
    }


    [HttpGet]
    public IActionResult GetAllMessages([FromQuery] int senderId, [FromQuery] int receiverId, [FromQuery] int? pageNumber = null, [FromQuery] int pageSize = 50)
    {
        var userId = int.Parse(User.Claims.FirstOrDefault(c => c.Type == "id")?.Value ?? "0");

        if (userId == 0 || (senderId != userId))
        {
            return Unauthorized("Invalid user token.");
        }
        if (pageSize < 1)
        {
            return BadRequest("Page size must be greater than 0.");
        }

        var messagesQuery = _context.Messages
            .Where(m => m.SenderId == senderId && m.ReceiverId == receiverId 
                        || m.SenderId == receiverId && m.ReceiverId == senderId);

        var totalMessages = messagesQuery.Count();
        var totalPages = (int)Math.Ceiling(totalMessages / (double)pageSize);

        if (!pageNumber.HasValue)
        {
            pageNumber = totalPages > 0 ? totalPages : 1; // Default to the last page if no page number is provided
        }

        if (pageNumber < 1 || pageNumber > totalPages)
        {
            return BadRequest("Page number is out of range.");
        }

        var messages = messagesQuery
            .OrderBy(m => m.Id)
            .Skip((pageNumber.Value - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        if (messages == null || messages.Count == 0)
        {
            return NotFound("No messages found for this user.");
        }

        var response = new
        {
            TotalMessages = totalMessages,
            PageNumber = pageNumber,
            PageSize = pageSize,
            Messages = messages
        };

        return Ok(response);
    }

}
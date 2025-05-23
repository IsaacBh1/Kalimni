namespace ChatApp_Backend.Features.Chats.Dtos;


public class SendMessageDto
{
    public required string Text { get; set; }
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
    public bool IsRead { get; set; } = false;
    public int SenderId { get; set; }
    public int ReceiverId { get; set; }
    public int? GroupId { get; set; }
}
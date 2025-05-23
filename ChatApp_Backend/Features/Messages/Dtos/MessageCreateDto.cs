using System.ComponentModel.DataAnnotations;

namespace ChatApp_Backend.Features.Messages.Dtos
{
    public class MessageCreateDto
    {
        [Required]
        public string Text { get; set; } = string.Empty;
        
        [Required]
        public int SenderId { get; set; }
        
        [Required]
        public int ReceiverId { get; set; }
        
        public int? GroupId { get; set; }
    }
}
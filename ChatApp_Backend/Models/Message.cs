using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChatApp_Backend.Models
{
    public class Message
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Text { get; set; } = string.Empty;

        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        public int SenderId { get; set; }

        [ForeignKey("SenderId")]
        public User Sender { get; set; } = null!;

        public int ReceiverId { get; set; }

        [ForeignKey("ReceiverId")]
        public User Receiver { get; set; } = null!;

        public bool IsRead { get; set; } = false;

        // A message can belong to a group (nullable for direct messages)
        public int? GroupId { get; set; }

        [ForeignKey("GroupId")]
        public Group? Group { get; set; }
    }
}

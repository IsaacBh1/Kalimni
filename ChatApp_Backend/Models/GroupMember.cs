using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChatApp_Backend.Models
{
    public class GroupMember
    {
        [Key]
        public int Id { get; set; }

        // Foreign keys
        public int GroupId { get; set; }
        [ForeignKey("GroupId")]
        public Group Group { get; set; } = null!;

        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; } = null!;

        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    }
}
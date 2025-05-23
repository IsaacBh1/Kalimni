namespace ChatApp_Backend.Features.Chats.Dtos
{
    public class FriendDto {
        public int Id { get; set; }
        public required string Username { get; set; }
        public required string Email { get; set; }
        public string? Bio { get; set; }
        public string? ProfilePictureUrl { get; set; }
        public DateTime JoinedAt { get; set; }
        public DateTime LastActive { get; set; }
        public bool IsOnline { get; set; }
    }
}
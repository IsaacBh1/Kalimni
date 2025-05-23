using ChatApp_Backend.Data;
using ChatApp_Backend.Features.Chats.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChatApp_Backend.Features.Chats
{
    [Route("[controller]")]
    [Authorize]
    public class ChatController : Controller
    {
        private readonly ChatDbContext _context;
        public ChatController(ChatDbContext context)
        {
            _context = context;
        }

        [HttpGet("friends")]
        public IActionResult GetFriends()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "id");
            if (userIdClaim == null)
                return Unauthorized("User ID claim not found in token.");

            if (!int.TryParse(userIdClaim.Value, out var userId))
                return BadRequest("Invalid user ID in token.");

            var friends = _context.Users
            .Where(u => u.Id == userId)
            .SelectMany(u => u.Friends)
            .Select(f => new FriendDto
            {
                Id = f.Id,
                Username = f.Username,
                Email = f.Email,
                LastActive = f.LastActive,
                IsOnline = f.IsOnline,
                ProfilePictureUrl = f.ProfilePictureUrl,
                Bio = f.Bio,
                JoinedAt = f.JoinedAt
            })
            .ToList();

            return Ok(friends);
        }

        [HttpGet("find")]
        public IActionResult FindByUsername(string username)
        {
            if (string.IsNullOrWhiteSpace(username))
                return BadRequest("Username cannot be empty.");

            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "id");
            if (userIdClaim == null)
                return Unauthorized("User ID claim not found in token.");

            if (!int.TryParse(userIdClaim.Value, out var userId))
                return BadRequest("Invalid user ID in token.");

            var users = _context.Users
            .Where(u => u.Username.ToLower().StartsWith(username.ToLower()) && u.Id != userId)
            .Select(u => new
            {
                u.Id,
                u.Username,
                u.Email,
                u.LastActive,
                u.IsOnline,
                u.ProfilePictureUrl,
            })
            .ToList();

            if (users.Count == 0)
                return NotFound("No users found matching the criteria.");

            return Ok(users);
        }

        [HttpGet("find/{id}")]
        public IActionResult FindById(int id)
        {
            var user = _context.Users
            .Where(u => u.Id == id)
            .Select(u => new
            {
                u.Id,
                u.Username,
                u.Email
            })
            .FirstOrDefault();

            if (user == null)
                return NotFound("User not found.");

            return Ok(user);
        }


        [HttpPost("add-friend")]
        public IActionResult AddFriend(int friendId)
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "id");
            if (userIdClaim == null)
                return Unauthorized("User ID claim not found in token.");

            if (!int.TryParse(userIdClaim.Value, out var userId))
                return BadRequest("Invalid user ID in token.");

            var user = _context.Users.FirstOrDefault(u => u.Id == userId);
            if (user == null)
                return NotFound("User not found.");

            var friend = _context.Users.FirstOrDefault(u => u.Id == friendId);
            if (friend == null)
                return NotFound("Friend not found.");

            if (user.Friends.Contains(friend))
                return BadRequest("This user is already your friend.");

            user.Friends.Add(friend);
            friend.Friends.Add(user);
            _context.SaveChanges();

            return Ok("Friend added successfully.");
        }

    }
}
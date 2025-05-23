using Microsoft.AspNetCore.SignalR;
using ChatApp_Backend.Models;
using ChatApp_Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace ChatApp_Backend.Hubs
{
    public class ChatHub : Hub
    {
        private readonly ChatDbContext _context;

        public ChatHub(ChatDbContext context)
        {
            _context = context;
        }

    public async Task SendMessage(int receiverId, string text, int? groupId = null)
    {
    var senderId = int.Parse(Context.UserIdentifier);
    
    // Validate receiver exists
    var receiverExists = await _context.Users.AnyAsync(u => u.Id == receiverId);
    if (!receiverExists) throw new HubException("Receiver not found");

    var message = new Message
    {
        Text = text,
        SenderId = senderId,
        ReceiverId = receiverId,
        GroupId = groupId,
        SentAt = DateTime.UtcNow,
        IsRead = false
    };

    _context.Messages.Add(message);
    await _context.SaveChangesAsync();

    var response = new 
    {
        message.Id,
        message.Text,
        message.SentAt,
        message.SenderId,
        message.ReceiverId,
        message.IsRead,
        message.GroupId
    };

    if (groupId.HasValue)
    {
        await Clients.Group($"Group_{groupId}").SendAsync("ReceiveMessage", response);
    }
    else
    {
        await Clients.Users(senderId.ToString(), receiverId.ToString())
            .SendAsync("ReceiveMessage", response);
        
        var sortedIds = new[] { senderId, receiverId }.OrderBy(id => id).ToArray();
        await Clients.Group($"direct_{sortedIds[0]}_{sortedIds[1]}")
            .SendAsync("ReceiveMessage", response);
    }
}
        public async Task JoinGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            await Clients.Caller.SendAsync("JoinedGroup", groupName);

            Console.WriteLine($"User {Context.UserIdentifier} joined group {groupName}");
        }

        public async Task JoinGroupById(int groupId)
        {
            string groupName = $"Group_{groupId}";
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            await Clients.Caller.SendAsync("JoinedGroup", groupName);
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.UserIdentifier;
            Console.WriteLine($"User connected: {userId}");

            if (!string.IsNullOrEmpty(userId))
            {
                var user = await _context.Users.FindAsync(int.Parse(userId));
                if (user != null)
                {
                    user.IsOnline = true;
                    user.LastActive = DateTime.UtcNow;
                    await _context.SaveChangesAsync();

                    await Clients.Others.SendAsync("UserOnline", userId);
                }
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.UserIdentifier;
            Console.WriteLine($"User disconnected: {userId}");

            if (!string.IsNullOrEmpty(userId))
            {
                var user = await _context.Users.FindAsync(int.Parse(userId));
                if (user != null)
                {
                    user.IsOnline = false;
                    user.LastActive = DateTime.UtcNow;
                    await _context.SaveChangesAsync();

                    // Notify others that this user is now offline
                    await Clients.Others.SendAsync("UserOffline", userId);
                }
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}
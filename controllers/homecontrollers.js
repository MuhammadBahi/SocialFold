const User = require('../modules/user')
const BlogPost = require('../modules/postmodule')
// const isLogedIn = require('../utils/isLogeedIn')

// Format time function
function formatTime(time) {
    const date = new Date(time);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    if (months < 12) return `${months}mo ago`;
    return `${years}y ago`;
}

module.exports.home = async (req,res)=>{
    const U_id = req.user._id
    
    const userid = await User.findOne({_id:U_id})
    const posts = await BlogPost.find().populate({
        path: 'users',
        model: 'Users',
        select: 'name username email image'
    });
    
    // Hybrid Feed Algorithm
    function sortPosts(posts, currentUserId) {
        return posts.sort((a, b) => {
            const aScore = calculatePostScore(a, currentUserId);
            const bScore = calculatePostScore(b, currentUserId);
            return bScore - aScore; // Higher score first
        });
    }
    
    function calculatePostScore(post, currentUserId) {
        const now = Date.now();
        const postTime = new Date(post.time).getTime();
        const hoursSincePost = (now - postTime) / (1000 * 60 * 60);
        
        // Time decay score (newer posts get higher score)
        const timeScore = Math.max(0, 100 - (hoursSincePost * 2)); // Decay over hours
        
        // Engagement score
        const likesScore = post.likes ? post.likes.length * 5 : 0;
        const commentsScore = post.comments ? post.comments.length * 3 : 0;
        
        // User relationship score
        let relationshipScore = 0;
        if (post.users && post.users.length > 0) {
            const postUserId = post.users[0]._id.toString();
            if (postUserId === currentUserId.toString()) {
                relationshipScore = 20; // Own posts get slight boost
            } else if (userid.following && userid.following.includes(postUserId)) {
                relationshipScore = 50; // Followed users get high boost
            }
        }
        
        // Random factor for variety (like Reddit)
        const randomFactor = Math.random() * 10;
        
        // Content quality score (based on post length)
        const contentLength = (post.title ? post.title.length : 0) + (post.content ? post.content.length : 0);
        const contentScore = Math.min(20, contentLength / 10); // Max 20 points for content
        
        // Media bonus
        const mediaBonus = (post.media || post.image) ? 15 : 0;
        
        const totalScore = timeScore + likesScore + commentsScore + relationshipScore + randomFactor + contentScore + mediaBonus;
        
        console.log(`Post "${post.title}" score:`, {
            timeScore,
            likesScore,
            commentsScore,
            relationshipScore,
            randomFactor,
            contentScore,
            mediaBonus,
            totalScore
        });
        
        return totalScore;
    }
    
    const sortedPosts = sortPosts(posts, U_id);
    res.render('home',{userData:userid,posts:sortedPosts,formatTime:formatTime})
}
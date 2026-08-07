import { MessageSquare } from "lucide-react";
import { remove, ref } from "firebase/database";
import { db } from "@/lib/firebase";

export default function NoticeBoardTab({ posts }: any) {
  return (
    <div className="w-full max-w-6xl mx-auto z-10 grid gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="text-blue-400 w-6 h-6" /> Village Notice Board
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts
          .sort((a: any, b: any) => b.timestamp - a.timestamp)
          .map((post: any) => (
            <div key={post.id} className="glass-card p-5 relative border-t-2 border-t-purple-500/50 flex flex-col">
              <div className="flex justify-between items-start mb-3 border-b border-white/5 pb-3">
                <div>
                  <h3 className="font-bold text-white text-sm">{post.authorName || "Village Member"}</h3>
                  <p className="text-xs text-purple-400 font-medium">{post.authorEmail || post.authorId}</p>
                </div>
                <button
                  onClick={async () => {
                    if (confirm("Are you sure you want to delete this notice?")) {
                      await remove(ref(db, `posts/${post.id}`));
                    }
                  }}
                  className="px-2 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-400 text-xs font-bold rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
              <div className="flex-1 text-sm text-slate-200 mb-3 whitespace-pre-wrap break-words">
                {post.content}
              </div>
              <div className="text-[10px] text-slate-500 text-right mt-auto">
                {post.timestamp ? new Date(post.timestamp).toLocaleString() : "Unknown"}
              </div>
            </div>
          ))}
        {posts.length === 0 && (
          <div className="col-span-full text-center p-12 text-slate-400 glass-card border border-white/5">
            <MessageSquare className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-50" />
            <p>No notices found on the Village Notice Board.</p>
          </div>
        )}
      </div>
    </div>
  );
}

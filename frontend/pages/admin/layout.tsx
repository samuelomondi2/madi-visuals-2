export default function AdminLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="min-h-screen flex bg-neutral-950 text-white">
        <aside className="w-64 bg-black p-6 border-r border-neutral-800">
          <h2 className="text-xl font-bold mb-6 text-[#D4AF37]">
            Admin Panel
          </h2>
  
          <nav className="space-y-4">
            <a href="/admin/upload" className="block hover:text-[#D4AF37]">
              Upload Media
            </a>
            <a href="/admin/media" className="block hover:text-[#D4AF37]">
              Media Library
            </a>
          </nav>
        </aside>
  
        <main className="flex-1 p-10">{children}</main>
      </div>
    );
  }
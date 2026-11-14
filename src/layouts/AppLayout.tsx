import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { CreatePlaylistModal } from '../components/CreatePlaylistModal';
import { FullScreenPlayer } from '../components/FullScreenPlayer';
import { MiniPlayer } from '../components/MiniPlayer';
import { MobileNavigation } from '../components/MobileNavigation';
import { MusicPlayer } from '../components/MusicPlayer';
import { Navbar } from '../components/Navbar';
import { Queue } from '../components/Queue';
import { Sidebar } from '../components/Sidebar';

export function AppLayout() {
  const [createPlaylistOpen, setCreatePlaylistOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-zinc-50 dark:bg-[#0B0D11] text-zinc-900 dark:text-zinc-100">
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar
          onOpenCreatePlaylist={() => setCreatePlaylistOpen(true)}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 pb-36 md:pb-8 soundify-scroll">
            <div className="max-w-7xl mx-auto">
              <Outlet context={{ openCreatePlaylist: () => setCreatePlaylistOpen(true) }} />
            </div>
          </main>
        </div>

        <Queue />
      </div>

      <MusicPlayer />
      <MiniPlayer />
      <MobileNavigation />
      <FullScreenPlayer />
      <CreatePlaylistModal
        isOpen={createPlaylistOpen}
        onClose={() => setCreatePlaylistOpen(false)}
      />
    </div>
  );
}

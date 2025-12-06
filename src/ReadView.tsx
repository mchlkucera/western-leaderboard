import { Reorder } from "framer-motion";

import { isFirebaseConfigured } from './lib/firebase';
import ConfigWarning from './components/ConfigWarning';
import PlayerCard from './components/PlayerCard';
import { useOutlaws } from './hooks/useOutlaws';
import { Layout } from './components/Layout';
import { Header } from './components/Header';
import { LoadingState } from './components/LoadingState';
import { EmptyState } from './components/EmptyState';

// Main Dashboard Component (Read-Only)
export default function ReadView() {
  const { 
    outlaws, 
    displayedOutlaws, 
    loading, 
    maxBounty 
  } = useOutlaws();

  // Show config warning if Firebase is not configured
  if (!isFirebaseConfigured) {
    return <ConfigWarning />;
  }

  return (
    <Layout>
      <Header />

      {loading ? (
        <LoadingState />
      ) : (
        <>
          {outlaws.length === 0 && <EmptyState />}

          {/* Leaderboard Grid */}
          <Reorder.Group 
              axis="y" 
              values={displayedOutlaws} 
              onReorder={() => {}} 
              className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4"
          >
            {displayedOutlaws.map((player, index) => {
              const currentPlayerData = outlaws.find(o => o.id === player.id) || player;
              
              return (
                <Reorder.Item
                  key={player.id}
                  value={player}
                  id={player.id}
                  style={{ cursor: "default" }}
                  drag={false}
                  className="h-full"
                >
                  <PlayerCard 
                    player={player} 
                    liveData={currentPlayerData}
                    index={index}
                    maxBounty={maxBounty}
                    isReadOnly={true}
                  />
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        </>
      )}
    </Layout>
  );
}

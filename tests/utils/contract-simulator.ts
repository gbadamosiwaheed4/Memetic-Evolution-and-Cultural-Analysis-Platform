// Simulated contract states
let memes: any[] = [];
let markets: any[] = [];
let analyses: any[] = [];
let lastTokenId = 0;
let lastMarketId = 0;

export const resetState = () => {
  memes = [];
  markets = [];
  analyses = [];
  lastTokenId = 0;
  lastMarketId = 0;
};

// Helper function to simulate contract calls
export const simulateContractCall = (contract: string, functionName: string, args: any[], sender: string) => {
  if (contract === 'meme-nft') {
    if (functionName === 'mint') {
      const [contentHash] = args;
      const tokenId = ++lastTokenId;
      memes.push({ 
        id: tokenId, 
        creator: sender, 
        contentHash, 
        createdAt: Date.now(), 
        remixedFrom: null 
      });
      return { success: true, value: tokenId };
    }
    if (functionName === 'remix') {
      const [originalId, newContentHash] = args;
      if (!memes.some(m => m.id === originalId)) {
        return { success: false, error: 'Original meme not found' };
      }
      const tokenId = ++lastTokenId;
      memes.push({ 
        id: tokenId, 
        creator: sender, 
        contentHash: newContentHash, 
        createdAt: Date.now(), 
        remixedFrom: originalId 
      });
      return { success: true, value: tokenId };
    }
    if (functionName === 'get-meme-data') {
      const [tokenId] = args;
      const meme = memes.find(m => m.id === tokenId);
      return meme ? { success: true, value: meme } : { success: false, error: 'Meme not found' };
    }
  }

  if (contract === 'prediction-market') {
    if (functionName === 'create-market') {
      const [memeId, duration] = args;
      const marketId = ++lastMarketId;
      markets.push({
        id: marketId,
        creator: sender,
        memeId,
        endHeight: Date.now() + duration,
        totalYes: 0,
        totalNo: 0,
        resolved: false,
        outcome: null
      });
      return { success: true, value: marketId };
    }
    if (functionName === 'predict') {
      const [marketId, prediction, amount] = args;
      const market = markets.find(m => m.id === marketId);
      if (!market) return { success: false, error: 'Market not found' };
      if (Date.now() >= market.endHeight) return { success: false, error: 'Market closed' };
      if (prediction) {
        market.totalYes += amount;
      } else {
        market.totalNo += amount;
      }
      return { success: true, value: true };
    }
    if (functionName === 'resolve-market') {
      const [marketId, outcome] = args;
      const market = markets.find(m => m.id === marketId);
      if (!market) return { success: false, error: 'Market not found' };
      if (Date.now() < market.endHeight) return { success: false, error: 'Market not resolved' };
      if (market.resolved) return { success: false, error: 'Market already resolved' };
      market.resolved = true;
      market.outcome = outcome;
      return { success: true, value: true };
    }
    if (functionName === 'get-market') {
      const [marketId] = args;
      const market = markets.find(m => m.id === marketId);
      return market ? { success: true, value: market } : { success: false, error: 'Market not found' };
    }
  }

  if (contract === 'cultural-analysis') {
    if (functionName === 'update-analysis') {
      const [memeId, analysis] = args;
      analyses[memeId] = { ...analysis, lastUpdated: Date.now() };
      return { success: true, value: true };
    }
    if (functionName === 'get-analysis') {
      const [memeId] = args;
      const analysis = analyses[memeId];
      return analysis ? { success: true, value: analysis } : { success: false, error: 'Analysis not found' };
    }
  }

  return { success: false, error: 'Contract or function not found' };
};


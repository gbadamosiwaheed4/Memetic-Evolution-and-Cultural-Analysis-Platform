import { describe, test, expect, beforeEach } from 'vitest';
import { simulateContractCall, resetState } from './utils/contract-simulator';

describe('Cultural Analysis', () => {
  const user1 = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  const admin = 'ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0';
  
  beforeEach(() => {
    resetState();
  });
  
  test('admin can update analysis', () => {
    simulateContractCall('meme-nft', 'mint', ['0x1234567890'], user1);
    const result = simulateContractCall('cultural-analysis', 'update-analysis', [1, { viralityScore: 80, culturalImpact: 70 }], admin);
    expect(result.success).toBe(true);
    expect(result.value).toBe(true);
    
    const analysisData = simulateContractCall('cultural-analysis', 'get-analysis', [1], user1);
    expect(analysisData.success).toBe(true);
    expect(analysisData.value.viralityScore).toBe(80);
    expect(analysisData.value.culturalImpact).toBe(70);
  });
  
  test('analysis can be updated multiple times', () => {
    simulateContractCall('meme-nft', 'mint', ['0x1234567890'], user1);
    simulateContractCall('cultural-analysis', 'update-analysis', [1, { viralityScore: 80, culturalImpact: 70 }], admin);
    const result = simulateContractCall('cultural-analysis', 'update-analysis', [1, { viralityScore: 90, culturalImpact: 85 }], admin);
    expect(result.success).toBe(true);
    expect(result.value).toBe(true);
    
    const analysisData = simulateContractCall('cultural-analysis', 'get-analysis', [1], user1);
    expect(analysisData.success).toBe(true);
    expect(analysisData.value.viralityScore).toBe(90);
    expect(analysisData.value.culturalImpact).toBe(85);
  });
  
  test('getting analysis for non-existent meme fails', () => {
    const result = simulateContractCall('cultural-analysis', 'get-analysis', [999], user1);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Analysis not found');
  });
});


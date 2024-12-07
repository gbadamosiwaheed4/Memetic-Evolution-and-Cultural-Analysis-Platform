import { describe, test, expect, beforeEach } from 'vitest';
import { simulateContractCall, resetState } from './utils/contract-simulator';

describe('Prediction Market', () => {
  const user1 = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  const user2 = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
  const admin = 'ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0';
  
  beforeEach(() => {
    resetState();
  });
  
  test('users can create markets', () => {
    simulateContractCall('meme-nft', 'mint', ['0x1234567890'], user1);
    const result = simulateContractCall('prediction-market', 'create-market', [1, 1000], user2);
    expect(result.success).toBe(true);
    expect(result.value).toBe(1);
    
    const marketData = simulateContractCall('prediction-market', 'get-market', [1], user2);
    expect(marketData.success).toBe(true);
    expect(marketData.value.creator).toBe(user2);
    expect(marketData.value.memeId).toBe(1);
  });
  
  test('users can make predictions', () => {
    simulateContractCall('meme-nft', 'mint', ['0x1234567890'], user1);
    simulateContractCall('prediction-market', 'create-market', [1, 1000], user2);
    const result = simulateContractCall('prediction-market', 'predict', [1, true, 100], user1);
    expect(result.success).toBe(true);
    expect(result.value).toBe(true);
    
    const marketData = simulateContractCall('prediction-market', 'get-market', [1], user2);
    expect(marketData.success).toBe(true);
    expect(marketData.value.totalYes).toBe(100);
  });
  
  test('users cannot predict on closed markets', () => {
    simulateContractCall('meme-nft', 'mint', ['0x1234567890'], user1);
    simulateContractCall('prediction-market', 'create-market', [1, -1000], user2); // Create an already closed market
    const result = simulateContractCall('prediction-market', 'predict', [1, true, 100], user1);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Market closed');
  });
  
  test('admin can resolve markets', () => {
    simulateContractCall('meme-nft', 'mint', ['0x1234567890'], user1);
    simulateContractCall('prediction-market', 'create-market', [1, -1000], user2); // Create an already closed market
    const result = simulateContractCall('prediction-market', 'resolve-market', [1, true], admin);
    expect(result.success).toBe(true);
    expect(result.value).toBe(true);
    
    const marketData = simulateContractCall('prediction-market', 'get-market', [1], user2);
    expect(marketData.success).toBe(true);
    expect(marketData.value.resolved).toBe(true);
    expect(marketData.value.outcome).toBe(true);
  });
  
  test('markets cannot be resolved twice', () => {
    simulateContractCall('meme-nft', 'mint', ['0x1234567890'], user1);
    simulateContractCall('prediction-market', 'create-market', [1, -1000], user2); // Create an already closed market
    simulateContractCall('prediction-market', 'resolve-market', [1, true], admin);
    const result = simulateContractCall('prediction-market', 'resolve-market', [1, false], admin);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Market already resolved');
  });
});


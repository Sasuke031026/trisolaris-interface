import {
  STAKING,
  StakingTri,
} from './stake-constants'
import { useMemo } from 'react'
import { useFarmsAPI } from './useFarmsAPI'
import { useFarmsContracts } from './useFarmContracts'
import { useActiveWeb3React } from '../../hooks'
import { ChainId } from '@trisolaris/sdk'

// gets the staking info from the network for the active chain id
export function useFarms(): StakingTri[] {
  const { chainId } = useActiveWeb3React()

  const activeFarms = STAKING[chainId ?? ChainId.AURORA]
  const farms = useFarmsAPI();
  const stakingInfo = useFarmsContracts();

  const stakingInfoMap = useMemo(() =>
    stakingInfo.reduce((acc, item) => {
      acc.set(item.ID, item);
      return acc;
    }, new Map())
    , [stakingInfo]);

  const farmsMap = useMemo(() =>
    farms.reduce((acc, item) => {
      acc.set(item.ID, item);
      return acc;
    }, new Map())
    , [farms]);

  const result = useMemo(() =>
    activeFarms.reduce<StakingTri[]>((acc, farm) => {
      const farmID = farm.ID;
      const farmResult = farmsMap.has(farmID)
        ? farmsMap.get(farmID)
        : farm;

      if (stakingInfoMap.has(farmID)) {
        const { stakedAmount } = stakingInfoMap.get(farmID);
        farmResult.stakedAmount = stakedAmount;
      }

      acc.push(farmResult);

      return acc;
    }, [])
    , [stakingInfoMap, farms]);

  return result;
}

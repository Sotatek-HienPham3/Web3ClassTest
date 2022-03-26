import moment from "moment"


export const MAX_UINT256 =
"115792089237316195423570985008687907853269984665640564039457584007913129639935";

export const URI_QUERY = 'https://api.thegraph.com/subgraphs/name/sotatek-hienpham3/subgraph';

export const convertTime = (time: any) => {
  return moment.unix(time).format('hh:mm, DD/MM/YYYY')
}

export const RPC_URL = 'https://rinkeby.infura.io/v3/29cf180bd7d140449664f288a7b36ee9';


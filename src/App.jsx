import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Text,
  IconButton,
  useColorMode
} from '@chakra-ui/react';
import { Alchemy, Network, Utils } from 'alchemy-sdk';
import { useState, useEffect } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa'
import { ethers } from 'ethers';
import Ethunicorn from './Ethunicorn.png';

function App() {
  
  // User Wallet State
  const [haveMetamask, sethaveMetamask] = useState(true);
  const [accountAddress, setAccountAddress] = useState('');
  const [accountBalance, setAccountBalance] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const { ethereum } = window;
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const {colorMode, toggleColorMode} = useColorMode();

  // State for showing balances
  const [userAddress, setUserAddress] = useState('');
  const [results, setResults] = useState([]);
  const [hasQueried, setHasQueried] = useState(false);
  const [tokenDataObjects, setTokenDataObjects] = useState([]);

  useEffect(() => {
    const { ethereum } = window;
    const checkMetamaskAvailability = async () => {
      if (!ethereum) {
        sethaveMetamask(false);
      }
      sethaveMetamask(true);
    };
    checkMetamaskAvailability();
  }, []);

  const connectWallet = async () => {
    try {
      if (!ethereum) {
        sethaveMetamask(false);
      }
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      let balance = await provider.getBalance(accounts[0]);
      let bal = ethers.utils.formatEther(balance);
      setAccountAddress(accounts[0]);
      setAccountBalance(bal);
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
    }
  };

  async function getNFTsForOwner() {
    try {
    const config = {
      apiKey: 'INSERT YOUR API KEY HERE',
      network: Network.ETH_MAINNET,
    };

    if (isConnected) {
      const address = accountAddress.toString()
      setUserAddress(ethers.utils.getAddress(address));
    }

    const alchemy = new Alchemy(config);
    const data = await alchemy.nft.getNftsForOwner(userAddress);
    setResults(data);

    const tokenDataPromises = [];

    for (let i = 0; i < data.ownedNfts.length; i++) {
      const tokenData = alchemy.nft.getNftMetadata(
        data.ownedNfts[i].contract.address,
        data.ownedNfts[i].tokenId
      );
      tokenDataPromises.push(tokenData);
    }

    setTokenDataObjects(await Promise.all(tokenDataPromises));
    setHasQueried(true);
  } catch (e) {
    console.log(e);
  }
  }
  return (
    <Box w="100vw">
      <Center>
        <Flex
          alignItems={'center'}
          justifyContent="center"
          flexDirection={'column'}
        >
          <IconButton
            icon={colorMode === 'dark' ? <FaSun /> : <FaMoon />}
            isRound="true"
            size="md"
            alignSelf="flex-end"
            onClick={toggleColorMode}
            mt={8}
          />
          < img src={Ethunicorn} 
          alt="Ethereum Rainbow Unicorn is awesomely dashing across page" 
          />
          <Heading mb={0} fontSize={36} mt={4} >
            NFT Indexer
          </Heading>
          <Text>
          Find all NFTs for any address on ETH Mainnet
          </Text>
        </Flex>
      </Center>
          <header className="App-header">
              {haveMetamask ? (
                <div className="App-header">
                  {isConnected ? (
                    <div className="card">
                      <div className="card-row">
                        <h3>Wallet Address:</h3>
                        <p>
                          {accountAddress.slice(0, 4)}...
                          {accountAddress.slice(38, 42)}
                        </p>
                      </div>
                      <div className="card-row">
                        <h3>Wallet ETH Balance:</h3>
                        <p>{accountBalance}</p>
                      </div>
                    </div>
                  ) : (
                    <div>Wallet Not Connected</div>
                  )}
                  {isConnected ? (
                    <p className="info">🎉 Connected Successfully</p>
                  ) : (
                    <button className="btn" onClick={connectWallet}>
                      Connect
                    </button>
                  )}
                </div>
              ) : (
                <p>Please Install MataMask</p>
              )}
          </header>
      <Flex
        w="100%"
        flexDirection="column"
        alignItems="center"
        justifyContent={'center'}
      >
        <Heading mt={42} fontSize={20}>
          If your MetaMask is connected, click the orange button below to see 
          your NFTs.
        </Heading>
        <Heading mt={1} fontSize={20}>
          To see any Ethereum address's NFTs, disconnect your wallet
        </Heading>
        <Heading mt={1} fontSize={20}>
          by refreshing the page and enter the address in the text box: 
        </Heading>
        <Input
          onChange={(e) => {
            const checkedAddress = ethers.utils.getAddress(e.target.value);
            return setUserAddress(checkedAddress)
          }}
          color="black"
          w="600px"
          textAlign="center"
          p={4}
          bgColor="white"
          fontSize={24}
          mt={8}
        />
        <Button fontSize={20} onClick={getNFTsForOwner} mt={10} bgColor="coral">
          Fetch NFTs
        </Button>

        <Heading my={10}>Here are your NFTs:</Heading>

        {hasQueried ? (
          <SimpleGrid w={'90vw'} columns={4} spacing={24}>
            {results.ownedNfts.map((e, i) => {
              return (
                <Flex
                  flexDir={'column'}
                  color="white"
                  bg="blue"
                  w={'20vw'}
                  key={e.id}
                >
                  <Box>
                    <b>Name:</b>{' '}
                    {tokenDataObjects[i].title?.length === 0
                      ? 'No Name'
                      : tokenDataObjects[i].title}
                  </Box>
                  <Image
                    src={
                      tokenDataObjects[i]?.rawMetadata?.image ??
                      'https://via.placeholder.com/200'
                    }
                    alt={'Image'}
                  />
                </Flex>
              );
            })}
          </SimpleGrid>
        ) : (
          'Please make a query! The query may take a few seconds...'
        )}
      </Flex>
    </Box>
  );
}

export default App;

const { ApiPromise, WsProvider } = require('@polkadot/api');

const getBlock = async (height) =>{
    const wsProvider = new WsProvider('wss://rpc.polkadot.io');
    const api = await ApiPromise.create({ provider: wsProvider });

    block = null;
    if(height){
        const hash = await api.rpc.chain.getBlockHash(height)
        block = await api.rpc.chain.getBlock(hash)
    } else {
      block = await api.rpc.chain.getBlock();
    }
      console.log(`The block is: ${block.block}`)	
	process.exit(0)
}

const main = () => {
  var stdin = process.stdin;

  // without this, we would only get streams once enter is pressed
  stdin.setRawMode( true );
  
  // resume stdin in the parent process (node app won't quit all by itself
  // unless an error or process.exit() happens)
  stdin.resume();
  // I don't want binary, do you?
  stdin.setEncoding( 'utf8' );
  running = true;
  // on any data into stdin
  stdin.on( 'data', function( key ){
      // ctrl-c ( end of text )
      if ( key === '\u0003' ) {
        running = false;
        process.exit();
      }
      if (key ===  '\r'){
        try{
          getBlock(key);
        }catch(e){
          console.log(" Wrong block height provided.")
        }
      }
      // write the key to stdout all normal like
      process.stdout.write( key );
  });
}

main()

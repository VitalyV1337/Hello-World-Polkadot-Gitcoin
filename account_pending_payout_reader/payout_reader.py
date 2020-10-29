import sys
import getopt
import requests

REQUEST_URL = 'http://127.0.0.1:8080/accounts/{}/staking-payouts?depth={}' \
              '&unclaimedOnly=true'

def request_payout(address, depth):
    return requests.get(REQUEST_URL.format(address,depth)).json()

def calcualte_payout(payout):
    total_payout = 0

    for era in payout['erasPayouts']:
        for validator in era['payouts']:
            total_payout += int(validator['nominatorStakingPayout'])

    # 10000000000 represents the amount of tokens that decimal has
    total_payout /= 10000000000

    return total_payout

def process_arguments(argv):
    address = ''
    depth = ''
    try:
      opts, args = getopt.getopt(argv,"ha:d:",["address=","depth="])
    except getopt.GetoptError:
      print ('payout_reader.py -a <address> -d <depth>')
      sys.exit(2)
    for opt, arg in opts:
      if opt == '-h':
          print ('payout_reader.py -a <address> -d <depth>')
          sys.exit()
      elif opt in ("-a", "--address"):
          address = arg
      elif opt in ("-d", "--depth"):
          depth = arg

    return address, depth

def main(argv):
    (address, depth) = process_arguments(argv)
    details = request_payout(address,depth)
    total_payout = calcualte_payout(details)
    print('{} KSM left in pending withdrawal for account {}'.format(
        total_payout, address))

if (__name__ == '__main__'):
    main(sys.argv[1:])
import React, {Component} from 'react';
import {View, StyleSheet, ScrollView, Text, Button} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../styles/colors';
import HeaderWithDrawer from '../components/HeaderWithMenu';
import CardCarousel from '../components/CardCarousel';
import Loader from '../components/Loader';
import Store from '../Store';
import BottomNotification from '../components/BottomNotification';

class Homepage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      accounts: [],
      balance: 0,
      showNotification: false,
      formValid: true,
      activeAccountCount: 0,
      carouselIndex: 0,
    };
    this.handleSnapToItem = this.handleSnapToItem.bind(this);
    this.fetchData = this.fetchData.bind(this);
    this.onAccountDel = this.onAccountDel.bind(this);
    this.handleCloseNotification = this.handleCloseNotification.bind(this);
  }

  componentDidMount() {
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      this.fetchData();
    });
  }

  onAccountDel = isValid => {
    if (isValid) {
      this.fetchData().then(res =>
        this.setState({showNotification: true, formValid: isValid}),
      );
    } else {
      this.setState({showNotification: true, formValid: isValid});
    }
  };

  handleCloseNotification() {
    this.setState({showNotification: false, formValid: true});
  }

  async fetchData() {
    this.setState({isLoading: true});
    await fetch(`${Store.getInstance().IP}api/Account/List`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        customNum: Store.getInstance().getUserID(),
      },
    })
      .then(response => response.json())
      .then(response => {
        this.setState({
          isLoading: false,
          accounts: response,
          activeAccountCount: response.length,
        });
        let tempBalance = 0.0;
        response.map(i => {
          tempBalance = tempBalance + i['balance'];
        });
        this.setState({balance: tempBalance});
      })
      .catch(e => console.error(e));
  }

  componentWillUnmount() {
    // Remove the event listener
    this.focusListener.remove();
  }

  handleSnapToItem(index) {
    this.setState({carouselIndex: index});
  }

  render() {
    const {navigate} = this.props.navigation;
    if (this.state.isLoading) {
      return (
        <Loader
          animationType="fade"
          modalVisible={this.state.isLoading}></Loader>
      );
    } else {
      return (
        // renkler arası geçiş yapıyor. flex:1 alabildiği tüm alanı almaya çalışıyor
        <LinearGradient
          style={{flex: 1}}
          colors={
            this.state.formValid
              ? [Colors.appDarkColor, Colors.appLightColor]
              : [Colors.errorLightColor, Colors.errorDarkColor]
          }>
          <View style={{flex: 1}}>
            <HeaderWithDrawer
              title="HIGH FIVE MOBILE"
              onPress={() =>
                this.props.navigation.openDrawer()
              }></HeaderWithDrawer>
            <ScrollView>
              <CardCarousel
                accountList={this.state.accounts}
                onAccountDel={this.onAccountDel}
                onSnap={this.handleSnapToItem}></CardCarousel>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  backgroundColor: Colors.grey7,
                  height: 80,
                  marginBottom: 20,
                  borderRadius: 16,
                  marginHorizontal: 10,
                }}>
                <Text style={{fontSize: 16, color: Colors.white}}>
                  Account balance
                </Text>
                <Text style={{fontSize: 24, color: Colors.white}}>{`₺ ${
                  this.state.accounts[this.state.carouselIndex]['balance']
                }`}</Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  backgroundColor: Colors.grey7,
                  paddingVertical: 26,
                  height: 160,
                  borderRadius: 16,
                  marginHorizontal: 10,
                }}>
                <View
                  style={{
                    alignContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                  }}>
                  <Text style={{color: Colors.white, top: -30}}>
                    Your Total Deposit
                  </Text>
                  <Text style={{fontSize: 27, color: Colors.white}}>
                    {`₺ ${this.state.balance}`}
                  </Text>
                </View>
                <View
                  style={{
                    alignContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                  }}>
                  <Text style={{color: Colors.white, top: -30}}>
                    Number of Active Accounts
                  </Text>
                  <Text style={{fontSize: 27, color: Colors.white}}>
                    {this.state.activeAccountCount}
                  </Text>
                </View>
              </View>
            </ScrollView>
            <BottomNotification
              showNotification={this.state.showNotification}
              handleCloseNotification={this.handleCloseNotification}
              notificationType={this.state.formValid ? 'Başarılı' : 'Hata'}
              firstLine={
                this.state.formValid
                  ? 'Hesap başarılı bir şekilde silindi.'
                  : 'Lütfen hesabın boş olduğuna emini olunuz.'
              }></BottomNotification>
          </View>
        </LinearGradient>
      );
    }
  }
}
export default Homepage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    color: Colors.grey4,
  },
  CardItem: {
    flexDirection: 'row',
    color: Colors.grey4,
  },
  button: {width: 200, height: 60, justifyContent: 'center'},
});

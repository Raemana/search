import React from 'react'
import {Text,View,ScrollView,StyleSheet, TouchableOpacity} from 'react-native'
import db from '../config'
import firebase from 'firebase'
import { FlatList, TextInput } from 'react-native-gesture-handler'
export default class Searchscreen extends React.Component {
    constructor(props){
        super(props)
        this.state={
            alltransactions:[],
            lastvisibletransaction: null,
            search:''
        }
    }
    componentDidMount=async()=>{
        const query=await db.collection("transaction").get()
        query.docs.map((doc)=>{
            this.setState({
                alltransactions:[],
                lastvisibletransaction:doc
            })
        })
    }
    fetchmoretransactions=async()=>{
        var text=this.state.search
        var entertext=text.split('')
        if(entertext[0]=='b'){
        const query=await db.collection('transaction').where('bookID','==',text).startAfter(this.state.lastvisibletransaction).limit(10).get()
        query.docs.map((doc)=>{
            this.setState({alltransactions:[...this.state.alltransactions,doc.data()],
            lastvisibletransaction:doc})
        })
    }
    else if(entertext[0]=='s'){
        const query=await db.collection('transaction').where('studentID','==',text).startAfter(this.state.lastvisibletransaction).limit(10).get()
        query.docs.map((doc)=>{
            this.setState({alltransactions:[...this.state.alltransactions,doc.data()],
            lastvisibletransaction:doc})
        })
    }
    }
    searchtransaction=async(text)=>{
        var entertext=text.split('')
        if(entertext[0]=='b'){
        const query=await db.collection('transaction').where('bookID','==',text).get()
        query.docs.map((doc)=>{
            this.setState({alltransactions:[...this.state.alltransactions,doc.data()],
            lastvisibletransaction:doc})
        })
    }
    else if(entertext[0]=='s'){
        const query=await db.collection('transaction').where('studentID','==',text).get()
        query.docs.map((doc)=>{
            this.setState({alltransactions:[...this.state.alltransactions,doc.data()],
            lastvisibletransaction:doc})
        })
    }
    }
    render(){
        return(
            <View style={styles.container}>
                <View style={style.searchBar}>
                    <TextInput
                    style={styles.bar}
                    placeholder='enter bookID or studentID'
                    onChangeText={(text)=>{
                        this.setState({
                        search:text
                        })
                    }}/>
                    <TouchableOpacity style={styles.searchButton}
                    onPress={()=>{

                    }}><Text>search</Text></TouchableOpacity>
                </View>
           <FlatList
               data={this.state.alltransactions}
               renderItem={({item})=>(
                <View style={{borderBottomWidth:3}}>
                           <Text>{'bookID:'+ item.bookID}</Text>
                           <Text>{'studentID:'+ item.studentID}</Text>
                           <Text>{'transactiontype:'+item.transactiontype}</Text>
                           <Text>{'date:'+item.date.toDate()}</Text>
                           </View>
               )}   
               keyExtractor={(item,index)=>index.toString()}
               onEndReached={this.fetchmoretransactions}
               onEndReachedThreshold={0.7}
               />
               </View>
        )
    }
}
const styles = StyleSheet.create({ 
    container: { flex: 1, marginTop: 20 }, 
    searchBar:{ flexDirection:'row', height:40, width:'auto', borderWidth:0.5, alignItems:'center', backgroundColor:'grey', },
     bar:{ borderWidth:2, height:30, width:300, paddingLeft:10, }, 
     searchButton:{ borderWidth:1, height:30, width:50, alignItems:'center', justifyContent:'center', backgroundColor:'green' } })
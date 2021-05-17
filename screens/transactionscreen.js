import React from 'react';
import { Text, View, TouchableOpacity, TextInput, Image, StyleSheet, Alert, KeyboardAvoidingView,ToastAndroid } from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as firebase from 'firebase'
import db from '../config'
export default class Transactionscreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedBookId: '',
        scannedStudentId:'',
        buttonState: 'normal',
        transactionmessage:''
      }
    }

    getCameraPermissions = async (id) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
        hasCameraPermissions: status === "granted",
        buttonState: id,
        scanned: false
      });
    }
    initiatebookIssue=async()=>{
      db.collection('transaction').add({
        studentID:this.state.scannedStudentId,bookID:this.state.scannedBookId,
        date:firebase.firestore.Timestamp.now().toDate(),transactiontype:'issue'
      })
      db.collection('books').doc(this.state.scannedBookId).update({
      'bookavailability': false
      })
      db.collection('students').doc(this.state.scannedStudentId).update({
        'numberofbooksissued': firebase.firestore.FieldValue.increment(1)
        })
        this.setState({
          scannedBookId:'',
          scannedStudentId:''
        })
    }
    initiatebookReturn=async()=>{
      db.collection('transaction').add({
        studentID:this.state.scannedStudentId,bookID:this.state.scannedBookId,
        date:firebase.firestore.Timestamp.now().toDate(),transactiontype:'return'
      })
      db.collection('books').doc(this.state.scannedBookId).update({
      'bookavailability': true
      })
      db.collection('students').doc(this.state.scannedStudentId).update({
        'numberofbooksissued': firebase.firestore.FieldValue.increment(-1)
        })
        this.setState({
          scannedBookId:'',
          scannedStudentId:''
        })
    }
    checkbookeligibility=async()=>{
      const bookref = await db.collection('books').where('bookID','==',this.state.scannedBookId).get();
      var transactiontype = ''
      if(bookref.docs.length==0){
        transactiontype=false
      }
      else{
        bookref.docs.map(doc=>{
          var book = doc.data()
          if(book.bookavailability){
            transactiontype='issue'
          }
          else{
            transactiontype='return'
          }
        })
      }
      return transactiontype;
    }
    checkstudenteligibilityforbookissue=async()=>{
      const studentref=await db.collection('students').where('studentID','==',this.state.scannedStudentId).get()
      var isstudenteligible=''
      if(studentref.docs.length==0){
        this.setState({
          scannedBookId:'',scannedStudentId:''
        })
        isstudenteligible=false
        Alert.alert('studentID does not exist in the database')
      }
      else{
        studentref.docs.map(doc=>{
          var student=doc.data()
          if(student.numberofbooksissued<2){
            isstudenteligible=true
          }
          else{
            isstudenteligible=false
            Alert.alert('student has already issued 2 books')
            this.setState({
              scannedBookId:'',scannedStudentId:''
            })
          }
        })
      }
      return isstudenteligible
    }
    checkstudenteligibilityforbookreturn=async()=>{
      const transactionref=await db.collection('transaction').where('bookID','==',this.state.scannedBookId).limit(1).get()
    var isstudenteligible=''
    transactionref.docs.map(doc=>{
      var lastbooktransaction=doc.data()
      if(lastbooktransaction.studentID===this.state.scannedStudentId){
        isstudenteligible=true
      }
      else{
        isstudenteligible=false
        Alert.alert("book wasn't issued by this student")
        this.setState({
          scannedBookId:'',scannedStudentId:''
        })
      }
    })
    return isstudenteligible
    }
    handleTransaction=async()=>{
      var transactiontype=await this.checkbookeligibility()
      if(!transactiontype){
        Alert.alert("book doesn't exist in the library database")
        this.setState({
          scannedBookId:'',scannedStudentId:''
        })
      }
      else if(transactiontype==='issue'){
        var isstudenteligible=await this.checkstudenteligibilityforbookissue()
        if(isstudenteligible){
          this.initiatebookIssue()
          Alert.alert("book issued to the student")
        }
      }
      else{
        var isstudenteligible=await this.checkstudenteligibilityforbookreturn()
        if(isstudenteligible){
          this.initiatebookReturn()
          Alert.alert("book returned to the library")
        }
      }
    }
    handleBarCodeScanned = async({type, data})=>{
      const {buttonState} = this.state

      if(buttonState==="BookId"){
        this.setState({
          scanned: true,
          scannedBookId: data,
          buttonState: 'normal'
        });
      }
      else if(buttonState==="StudentId"){
        this.setState({
          scanned: true,
          scannedStudentId: data,
          buttonState: 'normal'
        });
      }
      
    }

    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <KeyboardAvoidingView style={styles.container}behavior='padding'enabled>
            <View>
              <Image
                source={require("../assets/booklogo.jpg")}
                style={{width:200, height: 200}}/>
              <Text style={{textAlign: 'center', fontSize: 30}}>Wireless Library</Text>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Book Id"
              onChangeText={text=>this.setState({scannedBookId:text})}
              value={this.state.scannedBookId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("BookId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Student Id"
              onChangeText={text=>this.setState({scannedStudentId:text})}
              value={this.state.scannedStudentId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("StudentId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <Text>{this.state.transactionmessage}</Text>
            <TouchableOpacity style={styles.submitButton}onPress={async()=>{
              var transactionmessage=await this.handleTransaction()
            }}><Text style={styles.submitButtonText}>submit</Text></TouchableOpacity>
          </KeyboardAvoidingView>
        );
      }
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    },
    submitButton:{
      backgroundColor: '#66BB6A',
      width: 101,
      height: 51
    },
    submitButtonText:{
      color: 'black',
      fontSize: 21,
      textAlign: 'center',
      marginTop: 10
    }
  });
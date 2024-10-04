import { StyleSheet, StatusBar } from 'react-native';

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1, // Ensure the main container takes the full height
        backgroundColor: '#FFFFFF',
    },
    textSign: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    smallIcon: {
        marginRight: 10,
        fontSize: 24,
    },
    logoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        height: 90,
        width: 90,
        marginTop: 50,
        marginLeft: 10,
        marginRight: 10,
    },
    scrollViewContainer: {
        position: "relative",
        paddingBottom: 100, // Adjust the padding if necessary
    },
    trailImage: {
        position: "absolute",
        top: 0,
        left: 0, // Adjust based on your design
        zIndex: -1,
        height: '100%', // Make sure the image covers the height of the ScrollView
        resizeMode: 'contain', // Adjust this based on your needs
    },
    itemContainer: {
        flexDirection: "row",
        paddingVertical: 10,
        alignItems: "center",
    },
    itemImage: {
        width: 50,
        height: 50,
        marginRight: 15,
    },
    itemTextContainer: {
        flex: 1,
    },
    itemText: {
        fontSize: 16,
        fontWeight: "bold",
    },
    itemDescription: {
        fontSize: 14,
        color: "#888",
    },
    text_footer: {
        color: '#05375a',
        fontSize: 18,
    },
    action: {
        width: "85%",
        height: 50,
        flexDirection: 'row',
        marginTop: 10,
        paddingHorizontal: 20,
        borderWidth: 1.5,
        borderColor: 'black',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textInput: {
        flex: 1,
        color: '#49243E',
        fontSize: 16,
    },
    action2: {
        width: 300,
        height: 50,
        flexDirection: 'row',
        marginTop: 10,
        paddingHorizontal: 20,
        borderWidth: 1.5,
        borderColor: 'black',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,

    },
    textInput: {
        flex: 1,
        color: '#49243E',
        fontSize: 16,
    },
    loginContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 10,
        paddingVertical: 20,
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: 'white',
    },
    headerFilled: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#EFF7FF',
    },

    backButton: {
        marginTop: -10,
        marginBottom: 10,
        marginLeft: -20,
        height: 50,
        width: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    text_header: {
        color: '#49243E',
        fontSize: 18,
        textAlign: 'center',
        flex: 1,
        padding: 15,
        backgroundColor: '#EFF8FF',
    },
    roundedText: {
        borderRadius: 15,
        borderColor: 'black',
        borderWidth: 1,
    },
    inputContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    label: {
        fontSize: 18,
        alignSelf: 'flex-start',
        marginLeft: '7.5%',
        marginBottom: 5,
    },
    labelText: {
        fontSize: 16,
        alignSelf: 'flex-start',
        marginLeft: '7.5%',
        marginBottom: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        marginVertical: 10,
    },
    ButtonFill: {
        justifyContent: 'center',
        width: '85%',
        height: 50,
        backgroundColor: '#2566FE',
        alignItems: 'center',
        borderRadius: 10,
        shadowOpacity: 0.37,
        shadowRadius: 7.49,
        elevation: 12,
    },
    ButtonNoFill: {
        width: '85%',
        height: 50,
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        borderRadius: 10,
        shadowOpacity: 0.37,
        shadowRadius: 7.49,
        elevation: 12,
        borderColor: '#2566FE',
        borderWidth: 2,
    },
    ButtonNoFillHalf: {
        width: '40%',
        height: 50,
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        borderRadius: 10,
        shadowOpacity: 0.37,
        shadowRadius: 7.49,
        elevation: 12,
        borderColor: '#2566FE',
        borderWidth: 2,
        color: '#2566FE'
    },

    ButtonFillHalf: {
        width: '40%',
        height: 50,
        justifyContent: 'center',
        backgroundColor: '#2566FE',
        alignItems: 'center',
        borderRadius: 10,
        shadowOpacity: 0.37,
        shadowRadius: 7.49,
        elevation: 12,
        borderColor: '#2566FE',
        borderWidth: 2,
    },
    cityName: {
        fontSize: 20,
        textAlign: 'center',
        marginVertical: 10,
    },
    bottomButton: {
        width: '100%',
        // alignItems: 'center',
        marginVertical: 10,
        bottom: 20, // Adding space from the bottom
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        position: 'absolute', // Positioning at the bottom
    },
    changePasswordButton: {
        width: '100%',
        // alignItems: 'center',
        bottom: 100,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        position: 'absolute', // Positioning at the bottom
    },
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        paddingTop: 0, // Handle safe area manually
        justifyContent: 'space-between', // Ensures content is spaced out and the button is at the bottom
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
    },

    enlargedImage: {
        width: '90%',
        height: '70%',
        resizeMode: 'contain',
    },

    closeButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#ffffff',
        borderRadius: 5,
    },

    closeButtonText: {
        fontSize: 18,
        color: '#000',
    },
    smallLogo: {
        width: 30,
        height: 30,
        marginLeft: 10,
        resizeMode: 'contain', //
    },
    headerText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
    },
    rightLogo: {
        width: 40,
        height: 40,
        marginRight: 5,
        resizeMode: 'contain', // Ensure the image maintains its aspect ratio within the specified dimensions
    },
    Imagelogo: {
        width: 20,
        height: 20,
        marginRight: 5,
        resizeMode: 'contain', // Ensure the image maintains its aspect ratio within the specified dimensions
    },
    chatContainer: {
        paddingRight: 10,
        paddingLeft: 10,
        marginHorizontal: 5,
    },
    appMessage: {
        backgroundColor: '#EEE',
        borderRadius: 10,
        padding: 10,
        marginVertical: 5,
        alignSelf: 'flex-start',
        maxWidth: '80%',
    },
    userMessage: {
        backgroundColor: '#2566FE',
        borderRadius: 10,
        padding: 10,
        marginVertical: 5,
        alignSelf: 'flex-end',
        maxWidth: '80%',
    },
    messageContent: {
        fontSize: 14,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
    },
    chatBox: {
        flex: 1,
        justifyContent: 'space-between',
    },
    chatHeaderText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center', // Center horizontally
        marginBottom: 20, // Add a bit of space at the bottom for clarity
    },
    // optionsContainerProfile: {
    //     justifyContent: 'space-between',
    //     alignItems: 'flex-start', // Center horizontally
    //     marginBottom: 20, // Space between profile and options
    //     // marginVertical: 20,
    //     // marginHorizontal: 10
    // },
    optionBox: {
        width: '48%', // Adjust width for two columns
        backgroundColor: 'lightblue',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center', // Center content vertically
        marginBottom: 10,
        height: "28%"
    },
    optionBoxProfile: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 10,
        // padding: 20,
        height: 200, // Fixed height for profile box
        justifyContent: 'flex-start', // Center content vertically
        alignItems: 'flex-start', // Center content horizontally
    },

    // optionImage: {
    //   width: '100%',
    //   height: '50%'
    // },
    optionsContainerProfile: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 25,
        borderRadius: 10,
        marginBottom: 20,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Ensures the text and image are apart
        width: '100%',
    },
    textContainer: {
        flex: 1, // Takes up remaining space next to the image
    },
    profileName: {
        fontSize: 30,
        fontWeight: 'bold',
    },
    welcomeText: {
        fontSize: 17,
        color: 'black',
        fontWeight: 'condensedBold'
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 30, // Makes the image circular
        marginLeft: 20, // Adds space between text and image
    },

    optionText: {
        marginTop: "10%"
    },
    chatInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#DDD',
    },
    chatInput: {
        flex: 1,
        padding: 10,
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 20,
        marginRight: 10,
    },
    cameraButton: {
        padding: 10,
    },
    city: {
        marginVertical: 20,
        alignItems: 'center',
    },
    cityImage: {
        width: 400,
        height: 110, // Adjusted height to maintain aspect ratio
        resizeMode: 'contain', // Ensure the image maintains its aspect ratio within the specified dimensions
    },
    cityName: {
        fontSize: 20,
        textAlign: 'center',
        marginVertical: 10,
    },
    button: {
        alignItems: 'center',
        marginTop: 10,
        margin: 20,
    },
    inBut: {
        width: '70%',
        backgroundColor: '#49243E',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 50,
        shadowColor: '#49243E',
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.37,
        shadowRadius: 7.49,
        elevation: 12,
    },
    inBut2: {
        backgroundColor: '#704264',
        height: 50,
        width: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#704264',
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.37,
        shadowRadius: 7.49,
        elevation: 12,
    },
    smallIcon2: {
        fontSize: 40,
    },
    bottomText: {
        color: 'black',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 5,
    },
    textBig: {
        color: 'black',
        fontSize: 20,
        marginTop: 20,
        textAlign: 'center',
    },
    textSmall: {
        color: 'black',
        fontSize: 15,
        marginTop: 5,
        textAlign: 'center',
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    icon: {
        marginRight: 10,
    },
    itemText: {
        fontSize: 18,
    },






    backdrop: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        // backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent backdrop
        zIndex: 500, // Ensure backdrop appears above other elements
    },
    dropdownContainer: {
        position: 'absolute',
        top: 80, // Adjust as necessary to position below the logo
        backgroundColor: '#fff',
        borderColor: 'black',
        borderBottomWidth: 2,
        borderLeftWidth: 2,
        borderRightWidth: 2,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        zIndex: 1000, // Ensure dropdown appears above other elements
        width: '100%',
        height: '80%',
        marginTop: -30
    },
    cityd: {
        alignItems: 'center',
        justifyContent: 'center', // Center the content horizontally
        padding: 10,
        marginTop: 50
    },
    cityImaged: {
        width: 400,
        height: 110, // Adjusted height to maintain aspect ratio
        resizeMode: 'contain',
    },
    cityNamed: {
        fontSize: 16,
    },




    drawerSide: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 300,
        backgroundColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        zIndex: 1000,
    },
    contentSide: {
        flex: 1,
        padding: 20,
    },
    drawerTextSide: {
        fontSize: 18,
        marginBottom: 20,
    },
    closeButtonSide: {
        backgroundColor: '#2566FE',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    closeButtonTextSide: {
        color: '#FFF',
        fontSize: 16,
    },
    containerSide: {
        flex: 1,
        backgroundColor: '#F5FCFF',
    },
    contentTextSide: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
    },




    calendarIcon: {
        backgroundColor: '#2566FE',
        borderRadius: 10,
        padding: 10,
        marginVertical: 5,
        alignSelf: 'flex-end',
        maxWidth: '80%',
    },
    botImage: {
        width: 600, // Adjust the width as needed
        height: 100, // Adjust the height as needed
        resizeMode: "contain",
        marginVertical: 10,
        maxWidth: '100%',
        backgroundColor: '#EEE',
        borderRadius: 10,
        padding: 10,
        alignSelf: 'center',
    },

    drawer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: '100%',
        backgroundColor: '#EFF7FF',
        // padding: 10,
        // zIndex: 1000,
    },
    closeButton: {
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
    closeButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'blue',
    },
    link: {
        flexDirection: 'row',
        paddingVertical: 10,
    },
    linkText: {
        padding: 10,
        fontSize: 20,
        marginTop: -5
        // color: 'blue',
    },

    progressText: {
        fontSize: 20,
        fontWeight: 'bold',
        margin: 10,
        textAlign: 'right',
    },
    itemImage: {
        width: 60,
        height: 60,
        marginRight: 10,
        borderRadius: 40
    },
    itemText2: {
        fontSize: 16,
        flex: 1,
    },
    itemTextContainer: {
        flex: 1,
    },
    itemDescription: {
        fontSize: 14,
        marginTop: 5,
        color: '#555',
        flexWrap: 'wrap',
    },
    itemContainer2: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginBottom: 35
    },
    stripBackground: {
        alignSelf: 'flex-start',
        // width: 30,
        flex: 1,

    },

    accountContainer: {
        marginTop: 20,
    },
    nameText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    joinedText: {
        fontSize: 16,
        color: '#888',
    },
    // input: {
    //   borderWidth: 1,
    //   borderColor: '#888',
    //   padding: 8,
    //   borderRadius: 4,
    // },
    confirmButton: {
        padding: 16,
        borderRadius: 4,
        alignItems: 'center',
        marginTop: 20,
    },
    confirmButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    linkURL: {
        color: '#007bff',
        textDecorationLine: 'underline',
    },
    A: {
        color: 'red'
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalButtonGoogle: {
        padding: 10,
        marginTop: 10,
        alignItems: 'center',
        width: '20%',
        backgroundColor: '#2566FE',
        borderRadius: 10,
        shadowOpacity: 0.37,
        shadowRadius: 7.49,
        elevation: 12,
    },
    modalButtonInumeConnect: {
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        width: 200,
        alignItems: 'center',
    },
    modalButtonText: {
        color: 'white',
        fontSize: 16,
    },
});

export default styles;
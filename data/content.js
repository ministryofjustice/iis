module.exports = {
    err_msg:{ 
       LOGIN_ERROR:"Unable to sign in, try again",
       CANNOT_SUBMIT: "There was a problem submitting the form",
       NO_OPTION_SELECTED:"Invalid selection - hello",
       INVALID_ID:"The identifier you've entered doesn't look right",
       ATLEAST_ONE_REQUIRED:"All the fields cannot be empty",
       LETTERS_ONLY:"A name mustn't contain space, numbers or special characters",
       INVALID_DOB:"Invalid date of birth, idiot",
       INVALID_AGE:"Invalid age",
       INVALID_ID:"Unable to yield results"
    },
    
    view:{
        login: {title: "Enter user id and password"},
        
        
        search: {title: "What information do you have on the inmate?",
                 body: "Select all that apply"},
        
        changepassword: {
            title: "Contact administrator",
            body: "Send an email to whatever@digital.justice.gov.uk from the email address registered with IIS"
                        },
        
        identifier: {title: "Enter at least one unique identifier"},
        
        names: {title: "Enter at least one name"},
        
        dob: {title: "Enter inmate's date of birth or age/range"},
        
        results: {title: "Your search returned _x_ results"},
    } 

}
document.addEventListener('DOMContentLoaded', function() {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email('none'));

  // By default, load the inbox
  load_mailbox('inbox');
});


function compose_email(recipient) {
    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    // Clear out composition fields
    if (recipient == 'none') {
        document.querySelector('#compose-recipients').value = '';
    } else {
        document.querySelector('#compose-recipients').value = recipient;
    }
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';

    // convert form info to json and POST to api
    document.querySelector('form').onsubmit = function() {
        fetch('/emails', {
            method: 'POST',
            body: JSON.stringify({
                recipients: document.querySelector('#compose-recipients').value,
                subject: document.querySelector('#compose-subject').value,
                body: document.querySelector('#compose-body').value
            })
        })
        .then(response => response.json())
        .then(result => {
            // Print result
            console.log(result);
        })
        .catch(error => {
            console.log('Error: ', error)
        });
    }
}


// update whether email is read or unread
function readEmail(email) {
    console.log('read')
    const readButton = document.querySelector('#read-button')
    if (email.read) {
        readButton.innerText = 'Mark Read';
    } else {
        readButton.innerText = 'Mark unread';
    };
    // PUT updated email to api
    fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: !email.read
        })
    })
    // refresh page to inbox
    location.reload()
}

// update whether email is archived or unarchived
function archiveEmail(email) {
    console.log('archive')
    const archiveButton = document.querySelector('#archive-button');
    if (email.archived) {
        archiveButton.innerText = 'Archive';
    } else {
        archiveButton.innerText = 'Unarchive';
    };
    // PUT updated email to api
    fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: !email.archived
        })
    })
    .catch(error => {
        console.log('Error: ', error)
    });
    // refresh page to inbox
    location.reload()
}


function getEmail(id) {
    fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
        // set header
        document.querySelector('#emails-view').innerHTML = `<h3>${email.subject}</h3>`;
        const emailsView = document.getElementById('emails-view');
        // get recipients into list
        let receivers = '';
        email.recipients.forEach(function(recipient) {
            receivers += `${recipient} `
        })
        // create recipients element
        const recipients = document.createElement('p');
        recipients.innerText = `To: ${receivers}`
        recipients.style = 'margin: 0px;'
        emailsView.appendChild(recipients)
        // create sender element
        const sender = document.createElement('p');
        sender.innerText = `From: ${email.sender}`
        sender.style = 'margin: 0px;'
        emailsView.appendChild(sender)
        // create timestamp element
        const time = document.createElement('p')
        time.innerText = `${email.timestamp}`
        time.style = 'margin: 0px 0px 20px 0px;'
        emailsView.appendChild(time)
        // create email body element
        const body = document.createElement('p');
        body.innerText = `${email.body}`
        body.style = 'margin-top: 0px; margin-bottom: 10px'
        emailsView.appendChild(body)
        // if the sender of the email is currently logged in they will not have read/archive buttons
        const user = document.querySelector('#user').textContent;
        if (user !== email.sender) {
            const readButton = document.createElement('button');
            readButton.id = 'read-button'
            if (email.read) {
                readButton.innerText = 'Mark unread';
            } else {
                readButton.innerText = 'Mark Read';
            };
            readButton.className = 'email-button';
            readButton.onclick = () => {
                readEmail(email)
            }
            emailsView.appendChild(readButton);

            const replyButton = document.createElement('button');
            replyButton.id = 'reply-button';
            replyButton.innerText = 'Reply'
            replyButton.className = 'email-button';
            replyButton.onclick = () => {
                compose_email(email.sender)
            }
            emailsView.appendChild(replyButton);

            const archiveButton = document.createElement('button');
            archiveButton.id = 'archive-button'
            if (email.archived) {
                archiveButton.innerText = 'Unarchive';
            } else {
                archiveButton.innerText = 'Archive';
            };
            archiveButton.className = 'email-button';
            archiveButton.onclick = () => {
                archiveEmail(email)
            }
            emailsView.appendChild(archiveButton);
        };
    })
    .catch(error => {
        console.log('Error: ', error)
    });
}


function load_mailbox(mailbox) {
    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';

    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
        document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
        
        emails.forEach(function(email) {
            const miniEmail = document.createElement('div');
            miniEmail.style = 'margin-bottom: 10px';
            miniEmail.className = 'mini-email';
            const emailsView = document.getElementById('emails-view');
            let receivers = '';
            email.recipients.forEach(function(recipient) {
                receivers += `${recipient} `
            })
            const subject = document.createElement('button');
            subject.innerText = email.subject
            subject.className = 'subject'
            subject.onclick = () => {
                getEmail(email.id)
            }
            if (mailbox === 'sent') {
                miniEmail.appendChild(subject)
                const recipients = document.createElement('div');
                recipients.innerText = `To: ${receivers}`
                miniEmail.appendChild(recipients)
            } else {
                if (email.read) {
                    subject.style = 'color: black;'
                } else {
                    subject.style = 'color: #007bff;'
                }
                miniEmail.appendChild(subject)
                const sender = document.createElement('div');
                sender.innerText = `From: ${email.sender}`
                miniEmail.appendChild(sender)
            }
            const time = document.createElement('div')
            time.innerText = `${email.timestamp}`
            miniEmail.appendChild(time)
            emailsView.appendChild(miniEmail);
        })
    })
    .catch(error => {
        console.log('Error: ', error)
    });
}
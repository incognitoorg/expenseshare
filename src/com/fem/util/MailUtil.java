package com.fem.util;

import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

public class MailUtil {

	private static final Logger log = Logger.getLogger(MailUtil.class.getName());

	public void sendMail(String subject, String msgContent, HashMap<String, String> hmEmailIds) {

		log.info("In sendMail() of MailUtil...."); 

		try {
			Properties props = new Properties();
			Session session = Session.getDefaultInstance(props, null);

			MimeMessage msg = new MimeMessage(session);
			String SENDER_EMAIL_ADDRESS = "incognitoorg1@gmail.com"; //TODO : This should come from properties file.
			String SENDER_NAME = "Expense Share";
			msg.setFrom(new InternetAddress(SENDER_EMAIL_ADDRESS, SENDER_NAME));

			if(hmEmailIds == null) {
				msg.addRecipient(Message.RecipientType.TO, new InternetAddress("rahulkulapkar@gmail.com", "Rahul"));
				msg.addRecipient(Message.RecipientType.TO, new InternetAddress("vishwanatharondekar@gmail.com", "Vishwanath"));
			} else {
				for (Map.Entry<String, String> entry : hmEmailIds.entrySet()) { 
					msg.addRecipient(Message.RecipientType.TO, new InternetAddress(entry.getKey(), entry.getValue()));
				}
			}

			msg.setSubject(subject);
			msg.setText(msgContent, "utf-8", "html");
			Transport.send(msg);

			log.info("Mail sent successfully");

		} catch (UnsupportedEncodingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			log.log(Level.SEVERE, e.getStackTrace().toString());
		} catch (MessagingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			log.log(Level.SEVERE, e.getStackTrace().toString());
		}
	}

}

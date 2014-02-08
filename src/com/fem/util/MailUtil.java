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

	public static String getStackTrace (StackTraceElement[] stackTrace){
		String sStackTrace = "";
		for (StackTraceElement ste : stackTrace) {
			sStackTrace += ste +"<br>" ;
		}
		return sStackTrace;
	}
	
	
	public void sendMail(String subject, String msgContent, HashMap<String, String> hmEmailIds) {

		log.info("In sendMail() of MailUtil...."); 

		try {
			Properties props = new Properties();
			Session session = Session.getDefaultInstance(props, null);

			MimeMessage msg = new MimeMessage(session);
			String SENDER_EMAIL_ADDRESS = PropertiesUtil.getProperty("SENDER_EMAIL_ADDRESS");
			String SENDER_NAME = PropertiesUtil.getProperty("SENDER_NAME");
			msg.setFrom(new InternetAddress(SENDER_EMAIL_ADDRESS, SENDER_NAME));

			if(hmEmailIds == null) {
				msg.addRecipient(Message.RecipientType.TO, new InternetAddress(PropertiesUtil.getProperty("ADMINS")));
				log.info("Admin only mails " + PropertiesUtil.getProperty("ADMINS"));
			} else {
				for (Map.Entry<String, String> entry : hmEmailIds.entrySet()) { 
					msg.addRecipient(Message.RecipientType.TO, new InternetAddress(entry.getKey(), entry.getValue()!=null ? entry.getValue() : "User"));
					log.info("User email added - " + entry.getKey());
				}
				msg.addRecipient(Message.RecipientType.TO, new InternetAddress(PropertiesUtil.getProperty("ADMINS")));
				log.info("Admin added " + PropertiesUtil.getProperty("ADMINS"));
			}
			
			System.out.println(msgContent);

			msg.setSubject(subject);
			msg.setText(msgContent, "utf-8", "html");
			Transport.send(msg);

			log.info("Mail sent successfully");

		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
			log.log(Level.SEVERE, e.getStackTrace().toString());
		} catch (MessagingException e) {
			e.printStackTrace();
			log.log(Level.SEVERE, e.getStackTrace().toString());
		}
	}

}

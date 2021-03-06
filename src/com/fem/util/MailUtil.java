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
	
	
	
	public void sendToOne(String subject, String msgContent, String emailId){
		log.info("In sendToOne() of MailUtil...."); 
		
		StringBuilder sbMsgContent = new StringBuilder(msgContent);

		try {
			Properties props = new Properties();
			Session session = Session.getDefaultInstance(props, null);

			MimeMessage msg = new MimeMessage(session);
			String SENDER_EMAIL_ADDRESS = PropertiesUtil.getProperty("SENDER_EMAIL_ADDRESS");
			String SENDER_NAME = PropertiesUtil.getProperty("SENDER_NAME");
			msg.setFrom(new InternetAddress(SENDER_EMAIL_ADDRESS, SENDER_NAME));

			msg.addRecipient(Message.RecipientType.TO, new InternetAddress(emailId));
			log.info("User email added - " + emailId);
			
			System.out.println(sbMsgContent);

			msg.setSubject(subject);
			msg.setText(sbMsgContent.toString(), "utf-8", "html");
			Transport.send(msg);

			log.info("Mail sent successfully to user in sendToOne");
			
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
			log.log(Level.SEVERE, e.getStackTrace().toString());
		} catch (MessagingException e) {
			e.printStackTrace();
			log.log(Level.SEVERE, e.getStackTrace().toString());
		} catch (Exception e){
			e.printStackTrace();
			log.log(Level.SEVERE, e.getStackTrace().toString());
		}
	}
	
	//TODO : This method should be re-factored further for better control.
	public void sendToAll(String subject, String msgContent, HashMap<String, String> hmEmailIds) {

		log.info("In sendMail() of MailUtil...."); 
		
		StringBuilder sbMsgContent = new StringBuilder(msgContent);

		try {
			Properties props = new Properties();
			Session session = Session.getDefaultInstance(props, null);


			for (Map.Entry<String, String> entry : hmEmailIds.entrySet()) { 
				MimeMessage msg = new MimeMessage(session);
				String SENDER_EMAIL_ADDRESS = PropertiesUtil.getProperty("SENDER_EMAIL_ADDRESS");
				String SENDER_NAME = PropertiesUtil.getProperty("SENDER_NAME");
				msg.setFrom(new InternetAddress(SENDER_EMAIL_ADDRESS, SENDER_NAME));
				
				msg.addRecipient(Message.RecipientType.TO, new InternetAddress(entry.getKey(), entry.getValue()!=null ? entry.getValue() : "User"));
				log.info("User email added - " + entry.getKey());
				
				
				try {
					int index = sbMsgContent.indexOf("??username??");
					
					String emailContent = new String(sbMsgContent);
					StringBuilder sbEmailContent = new StringBuilder(emailContent);
					
					sbEmailContent.replace(index, index + 12, entry.getValue()!=null ? entry.getValue() : "User");
					
					
					
					System.out.println(sbEmailContent);
					
					msg.setSubject(subject);
					msg.setText(sbEmailContent.toString(), "utf-8", "html");
					Transport.send(msg);
					
					
					//TODO : Sending email to admin every time it is sent to user. This should be removed going ahead as app becomes big.
					MimeMessage msgAdmin = new MimeMessage(session);
					msgAdmin.setFrom(new InternetAddress(SENDER_EMAIL_ADDRESS, SENDER_NAME));
					msgAdmin.addRecipient(Message.RecipientType.BCC, new InternetAddress("admins"));
					msgAdmin.setSubject(subject);
					msgAdmin.setText(sbEmailContent.toString(), "utf-8", "html");
					Transport.send(msgAdmin);
				} catch (Exception e){
					new MailUtil().sendToAdmin("Exception occured while sending email in for. " + entry.getValue() + " " + entry.getKey(), e.getStackTrace().toString());
				}
				
				

				
				log.info("Sent email to admin ");
				log.info("Sending email to admin every time it is sent to user. This should be removed going ahead as app becomes big.");
				

				log.info("Mail sent successfully");
			}
			
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
			log.log(Level.SEVERE, e.getStackTrace().toString());
			new MailUtil().sendToAdmin("Exception occured while sending email", e.getStackTrace().toString());
		} catch (MessagingException e) {
			e.printStackTrace();
			log.log(Level.SEVERE, e.getStackTrace().toString());
			new MailUtil().sendToAdmin("Exception occured while sending email", e.getStackTrace().toString());
		} catch (Exception e){
			e.printStackTrace();
			log.log(Level.SEVERE, e.getStackTrace().toString());
			new MailUtil().sendToAdmin("Exception occured while sending email", e.getStackTrace().toString());
		}
	}
	
	
	public String sendToAdmin(String subject, String msgContent){
		
		Properties props = new Properties();
		Session session = Session.getDefaultInstance(props, null);

		MimeMessage msg = new MimeMessage(session);
		String SENDER_EMAIL_ADDRESS = PropertiesUtil.getProperty("SENDER_EMAIL_ADDRESS");
		String SENDER_NAME = PropertiesUtil.getProperty("SENDER_NAME");
		
		try {
			
			msg.setFrom(new InternetAddress(SENDER_EMAIL_ADDRESS, SENDER_NAME));
			msg.addRecipient(Message.RecipientType.TO, new InternetAddress("admins")); //Setting the property admins sends it to GAE admin google account. It has seperate quota for that.
			
			System.out.println(msgContent);
			
			msg.setSubject(subject);
			msg.setText(msgContent.toString(), "utf-8", "html");
			Transport.send(msg);
			
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
			log.log(Level.SEVERE, e.getStackTrace().toString());
		} catch (MessagingException e) {
			e.printStackTrace();
			log.log(Level.SEVERE, e.getStackTrace().toString());
		}

		log.info("Mail sent to admin successfully");
		return null;
	}

}

package com.fem.util;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.util.Iterator;
import java.util.Properties;
import java.util.Set;

public class TemplateUtil {

	private static Properties props;

	static
	{
		props = new Properties();
		try
		{
			TemplateUtil util = new TemplateUtil();
			props = util.getPropertiesFromClasspath("configuration/templates.properties");
			props = util.getTemplatesFromClasspath();
		}
		catch (FileNotFoundException e)
		{
			new MailUtil().sendMail("Exception occured ", e.getMessage(), null);
			e.printStackTrace();
		}
		catch (IOException e)
		{
			new MailUtil().sendMail("Exception occured ", e.getMessage(), null);
			e.printStackTrace();
		}
	}

	// private constructor
	private TemplateUtil()
	{
	}

	public static String getProperty(String key)
	{
		return props.getProperty(key);
	}

	public static Set<Object> getkeys()
	{
		return props.keySet();
	}

	public static String getTemplate(String templatename) {
		return props.getProperty(templatename);
	}

	/**
	 * loads properties file from classpath
	 * 
	 * @param propFileName
	 * @return
	 * @throws IOException
	 */
	private Properties getPropertiesFromClasspath(String propFileName)
			throws IOException {
		Properties props = new Properties();
		InputStream inputStream =
				this.getClass().getClassLoader().getResourceAsStream(propFileName);

		if (inputStream == null)
		{
			throw new FileNotFoundException("property file '" + propFileName
					+ "' not found in the classpath");
		}

		props.load(inputStream);
		
		return props;
	}
	
	private Properties getTemplatesFromClasspath()
			throws IOException {
		Properties props = new Properties();
		String template = "";
		
		Set<Object> keyset = TemplateUtil.getkeys();
		String sKey = "";
		for(Iterator<Object> itr = keyset.iterator(); itr.hasNext();) {
			sKey = (String) itr.next();
			System.out.println("sKey :: " + sKey);
			
			BufferedReader br = null;

			try {

				br = new BufferedReader(new FileReader(this.getClass().getClassLoader().getResource("").getPath() + "templates/" + TemplateUtil.getProperty(sKey)));
				StringBuilder sb = new StringBuilder();
				String line = br.readLine();

				while (line != null) {
					sb.append(line);
					sb.append(System.lineSeparator());
					line = br.readLine();
				}
				template = sb.toString();
				
				props.put(sKey, template);
				
			} catch (FileNotFoundException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} finally {
				try {
					br.close();
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}
		}
		
		return props;
	}
}

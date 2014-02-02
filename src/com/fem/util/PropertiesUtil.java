package com.fem.util;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;
import java.util.Set;

public class PropertiesUtil {

	private static Properties props;

	static
	{
		props = new Properties();
		try
		{
			PropertiesUtil util = new PropertiesUtil();
			props = util.getPropertiesFromClasspath("configuration/configuration.properties");
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
	private PropertiesUtil()
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
}
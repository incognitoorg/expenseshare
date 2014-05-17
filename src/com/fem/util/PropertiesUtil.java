package com.fem.util;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.Iterator;
import java.util.Properties;
import java.util.Set;
import java.util.logging.Logger;

import org.datanucleus.util.StringUtils;




public class PropertiesUtil {

	private static Properties props;
	private static final Logger log = Logger.getLogger(PropertiesUtil.class.getName());


	static
	{
		props = new Properties();
		try
		{
			PropertiesUtil util = new PropertiesUtil();
			props = util.getPropertiesFromClasspath("configuration/configuration.properties");
			
			Properties modeProperties = util.getPropertiesFromClasspath("configuration/mode.properties");
			
			
			String xpenseshareMode = modeProperties.getProperty("MODE");
			//String xpenseshareMode = System.getenv().get("XPENSESHARE_MODE");
			if(!StringUtils.isEmpty(xpenseshareMode) ){
				xpenseshareMode = xpenseshareMode+"/";
				try {
					Properties propsToOverride = util.getPropertiesFromClasspath("configuration/"  + xpenseshareMode + "configuration.properties");
					Set<String> keys = propsToOverride.stringPropertyNames();
					for (Iterator<String> iterator = keys.iterator(); iterator.hasNext();) {
						String key = (String) iterator.next();
						props.setProperty(key, propsToOverride.getProperty(key));
					}
				} catch (FileNotFoundException e){
					log.warning("Configuration file 'configuration/" + xpenseshareMode + "configuration.properties' not found. Using production configurations." );
				}
			}
			
		}
		catch (FileNotFoundException e)
		{
			log.severe("Red alert. Base Configuration file missing." );
			new MailUtil().sendToAdmin("Exception occured ", e.getMessage());
			e.printStackTrace();
		}
		catch (IOException e)
		{
			new MailUtil().sendToAdmin("Exception occured ", e.getMessage());
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
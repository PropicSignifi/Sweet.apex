public class TemplateDemo {
    public static final Log logger = Log.getLogger(TemplateDemo.class);

    public static void main() {

        if(logger.isDebugEnabled()) {
            logger.debug('Hello World');
        }
        if(logger.isDebugEnabled()) {
            logger.debug('a,b', 'c,d');
        }
    }
}
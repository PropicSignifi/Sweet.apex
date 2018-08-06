@MyAnnotation(name='Test')
public class AnnotationDemo {
    public @interface MyAnnotation {
        public String name();

        public Integer number() default 10;
    }
}

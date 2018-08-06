public class AnnotationDemo {
    public class MyAnnotation {
        private String m_name;
        private Integer m_number = 10;
        public MyAnnotation name(String m_name) {
            this.m_name = m_name;
            return this;
        }
        public String name() {
            return this.m_name;
        }
        public MyAnnotation number(Integer m_number) {
            this.m_number = m_number;
            return this;
        }
        public Integer number() {
            return this.m_number;
        }
    }
}
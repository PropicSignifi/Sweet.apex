public class Sweet {
    public static void assertNotNull(Object value, String message) {
        if(value == null) {
            throw new SweetException(message);
        }
    }

    public virtual class BaseEnum {
        private String name;
        private Integer ordinal;

        protected BaseEnum setName(String name) {
            this.name = name;

            return this;
        }

        protected BaseEnum setOrdinal(Integer ordinal) {
            this.ordinal = ordinal;

            return this;
        }

        public virtual override String toString() {
            return this.name;
        }

        public Integer ordinal() {
            return this.ordinal;
        }
    }

    public class SweetException extends Exception {
    }
}

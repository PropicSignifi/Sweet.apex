/**
 * Sample class for ApexDoc
 *
 * @author Wilson
 * @version 1.0.0
 * */
public class ApexDoc {
    // The name
    private String name;

    /**
     * The id
     *
     * @deprecated
     * */
    public String id;

    /**
     * Run
     *
     * @example
     * new ApexDoc().run(0);
     *
     * @param i The seed
     * */
    @future(callout=true)
    public void run(Integer i) {
    }

    /**
     * My interface
     *
     * @author Adam
     * */
    public interface MyInterface {
    }

    /**
     * My enum
     *
     * @author Henry
     * */
    public enum MyEnum {
        One, Two, Three;
    }
}

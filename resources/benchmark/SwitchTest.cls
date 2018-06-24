public class SwitchTest {
    public static void test() {
        Integer i = 3;
        Object SwitchTest_test_s = i;
        if(SwitchTest_test_s == 0) {
            System.debug('0');
        } else {
            if(SwitchTest_test_s == 1) {
            }
            if(SwitchTest_test_s == 2) {
                System.debug('other');
            }
            return;
        }
    }
}
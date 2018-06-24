public class SwitchTest {
    public static void test() {
        Integer i = 3;
        switch(i) {
            case 0:
                System.debug('0');
                break;
            case 1:
            case 2:
                System.debug('other');
            default:
                return;
        }
    }
}

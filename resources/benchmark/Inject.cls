public class Inject {
    private Case c1 = (Case)Sweet.getBean(Case.class);

    private Case c2 = (Case)Sweet.getBean('demo');

    private Case c3 = (Case)Sweet.getBean('demo');
}